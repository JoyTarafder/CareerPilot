import { GoogleGenAI } from '@google/genai';
import {
  BulletImprovementResponse,
  SummaryImprovementResponse,
  CoverLetterResponse,
} from '@careerpilot/contracts';
import { RedactionService } from './redaction.service.js';

export interface IAIWritingAdapter {
  improveBullet(originalBullet: string, contextRole?: string, targetKeywords?: string[]): Promise<BulletImprovementResponse>;
  improveSummary(originalSummary: string, targetRole: string, skills: string[]): Promise<SummaryImprovementResponse>;
  generateCoverLetter(
    candidateName: string,
    resumeData: {
      summary?: string;
      skills: string[];
      experiences: { role: string; company: string; highlights: string[] }[];
      educations: { degree: string; institution: string }[];
    },
    jobData: {
      title: string;
      company?: string;
      requiredSkills: string[];
      responsibilities: string[];
    },
    tone: string
  ): Promise<CoverLetterResponse>;
}

export class GeminiWritingAdapter implements IAIWritingAdapter {
  private aiClient: GoogleGenAI | null = null;

  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (apiKey && apiKey !== 'replace-with-gemini-api-key') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
      } catch {
        this.aiClient = null;
      }
    }
  }

  // Hallucination Guardrail Check
  public detectUnsupportedMetrics(original: string, suggested: string): string | null {
    const metricRegex = /(?:\b\d+%(?!\w)|\$\d+[\d,kmb]*|\b\d+x\b|\b\d+\+?\s*(?:users|clients|requests|ms|seconds|dollars|percent|reduction|increase|revenue|growth)\b)/gi;
    const originalMetrics = new Set((original.match(metricRegex) || []).map((m) => m.toLowerCase().trim()));
    const suggestedMetrics = (suggested.match(metricRegex) || []).map((m) => m.toLowerCase().trim());

    const inventedMetrics = suggestedMetrics.filter((m) => !originalMetrics.has(m));
    if (inventedMetrics.length > 0) {
      const uniqueInvented = Array.from(new Set(inventedMetrics));
      return `Suggestion incorporates quantifiable claims (${uniqueInvented.join(
        ', '
      )}) not evidenced in your original draft. Ensure you verify and adjust these numbers to reflect your actual accomplishments.`;
    }
    return null;
  }

  async improveBullet(
    originalBullet: string,
    contextRole?: string,
    targetKeywords: string[] = []
  ): Promise<BulletImprovementResponse> {
    const redacted = RedactionService.redact(originalBullet);

    if (this.aiClient) {
      try {
        const prompt = `You are an expert career editor and ATS resume consultant. Your task is to rewrite the resume bullet below using the Google XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
CRITICAL RULE: Do NOT invent fake percentages, revenue amounts, team sizes, or technologies not mentioned in the source bullet.
Role Context: ${contextRole || 'Software Professional'}
Target Keywords to Naturally Weave: ${targetKeywords.join(', ') || 'None'}

<BULLET>
${redacted}
</BULLET>

Respond strictly in JSON with:
{
  "suggested": "the rewritten high-impact bullet point",
  "why": "concise explanation of why this formulation improves clarity, action orientation, or ATS readability"
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          const suggested = parsed.suggested || originalBullet;
          const warning = this.detectUnsupportedMetrics(originalBullet, suggested);
          return {
            original: originalBullet,
            suggested,
            why: parsed.why || 'Enhanced with strong action verb and outcome orientation.',
            unsupportedClaimsWarning: warning,
          };
        }
      } catch {
        // Fallback to rule-based engine on API error
      }
    }

    return this.fallbackImproveBullet(originalBullet, targetKeywords);
  }

  async improveSummary(
    originalSummary: string,
    targetRole: string,
    skills: string[] = []
  ): Promise<SummaryImprovementResponse> {
    const redacted = RedactionService.redact(originalSummary);

    if (this.aiClient) {
      try {
        const prompt = `You are a senior executive resume editor. Enhance the candidate professional summary below to be compelling, concise (3-4 sentences), and aligned with the target role.
CRITICAL RULE: Never invent degrees, years of experience, or employers.
Target Role: ${targetRole}
Key Verified Skills: ${skills.join(', ')}

<SUMMARY>
${redacted}
</SUMMARY>

Respond strictly in JSON with:
{
  "suggested": "refined high-impact professional summary",
  "why": "explanation of strategic positioning improvements"
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          const suggested = parsed.suggested || originalSummary;
          const warning = this.detectUnsupportedMetrics(originalSummary, suggested);
          return {
            original: originalSummary,
            suggested,
            why: parsed.why || 'Positioned directly for target role with highlighted core competencies.',
            unsupportedClaimsWarning: warning,
          };
        }
      } catch {
        // Fallback
      }
    }

    return this.fallbackImproveSummary(originalSummary, targetRole, skills);
  }

  async generateCoverLetter(
    candidateName: string,
    resumeData: {
      summary?: string;
      skills: string[];
      experiences: { role: string; company: string; highlights: string[] }[];
      educations: { degree: string; institution: string }[];
    },
    jobData: {
      title: string;
      company?: string;
      requiredSkills: string[];
      responsibilities: string[];
    },
    tone = 'professional'
  ): Promise<CoverLetterResponse> {
    if (this.aiClient) {
      try {
        const prompt = `You are a professional cover letter strategist. Write a tailored, evidence-grounded cover letter connecting the candidate's verified background to the job requirements.
Tone: ${tone}
Target Role: ${jobData.title}
Target Company: ${jobData.company || 'Hiring Team'}

Candidate Verified Facts:
Skills: ${resumeData.skills.join(', ')}
Recent Experience: ${resumeData.experiences.map((e) => `${e.role} at ${e.company}: ${e.highlights.join('; ')}`).join('\n')}
Education: ${resumeData.educations.map((ed) => `${ed.degree} from ${ed.institution}`).join(', ')}

CRITICAL RULE: Every single assertion of experience or achievement must be strictly grounded in the candidate's verified facts above. Do NOT invent achievements or unlisted roles.

Respond strictly in JSON:
{
  "recipient": "Hiring Team",
  "salutation": "Dear Hiring Manager,",
  "opening": "Opening paragraph stating enthusiasm and targeted value proposition",
  "bodyParagraphs": ["Paragraph 1 connecting verified technical experience to role", "Paragraph 2 connecting projects and outcomes to key responsibilities"],
  "closing": "Closing paragraph reiterating interest and request for interview",
  "groundedClaims": ["list of factual claims drawn directly from resume"]
}`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            recipient: parsed.recipient || 'Hiring Team',
            salutation: parsed.salutation || 'Dear Hiring Manager,',
            opening: parsed.opening || '',
            bodyParagraphs: Array.isArray(parsed.bodyParagraphs) ? parsed.bodyParagraphs : [],
            closing: parsed.closing || 'Sincerely,',
            groundedClaims: Array.isArray(parsed.groundedClaims) ? parsed.groundedClaims : resumeData.skills.slice(0, 4),
            unsupportedClaimsWarning: null,
          };
        }
      } catch {
        // Fallback
      }
    }

    return this.fallbackGenerateCoverLetter(candidateName, resumeData, jobData, tone);
  }

  // Deterministic Rule-Based Fallbacks for High Reliability
  private fallbackImproveBullet(
    originalBullet: string,
    targetKeywords: string[] = []
  ): BulletImprovementResponse {
    let clean = originalBullet.trim().replace(/^\s*[-•*]\s*/, '');
    let verb = clean.split(' ')[0] || 'Executed';

    // Replace weak opening verbs
    const weakVerbs: Record<string, string> = {
      worked: 'Spearheaded engineering initiatives for',
      helped: 'Collaborated cross-functionally to engineer',
      responsible: 'Directed core implementation and maintenance of',
      did: 'Architected and deployed',
      made: 'Developed and optimized',
      handled: 'Managed end-to-end delivery of',
    };

    const lowerVerb = verb.toLowerCase();
    let suggested = clean;
    if (weakVerbs[lowerVerb]) {
      const rest = clean.slice(verb.length).trim();
      suggested = `${weakVerbs[lowerVerb]} ${rest}`;
    } else {
      suggested = `Spearheaded ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    }

    // Ensure ending with period
    if (!suggested.endsWith('.')) suggested += '.';

    // Check for target keyword weaving
    if (targetKeywords.length > 0 && targetKeywords[0]) {
      const kw = targetKeywords[0];
      if (!suggested.toLowerCase().includes(kw.toLowerCase())) {
        suggested = suggested.replace(/\.$/, `, leveraging ${kw} for system scalability.`);
      }
    }

    const warning = this.detectUnsupportedMetrics(originalBullet, suggested);

    return {
      original: originalBullet,
      suggested,
      why: 'Replaced passive phrasing with strong action verb and outcome-focused structure.',
      unsupportedClaimsWarning: warning,
    };
  }

  private fallbackImproveSummary(
    originalSummary: string,
    targetRole: string,
    skills: string[] = []
  ): SummaryImprovementResponse {
    const topSkills = skills.slice(0, 3).join(', ');
    const suggested = `Results-oriented ${targetRole} with proven background in ${
      topSkills || 'modern software engineering'
    }. ${originalSummary.trim().replace(/^I am a /i, '')} Dedicated to driving measurable technical outcomes and reliable system architecture.`;

    const warning = this.detectUnsupportedMetrics(originalSummary, suggested);

    return {
      original: originalSummary,
      suggested,
      why: 'Directly aligns executive positioning with target role and anchors top core competencies.',
      unsupportedClaimsWarning: warning,
    };
  }

  private fallbackGenerateCoverLetter(
    candidateName: string,
    resumeData: {
      summary?: string;
      skills: string[];
      experiences: { role: string; company: string; highlights: string[] }[];
      educations: { degree: string; institution: string }[];
    },
    jobData: {
      title: string;
      company?: string;
      requiredSkills: string[];
      responsibilities: string[];
    },
    _tone: string
  ): CoverLetterResponse {
    const company = jobData.company || 'the hiring team';
    const role = jobData.title;
    const topExp = resumeData.experiences[0];
    const topSkills = resumeData.skills.slice(0, 4);

    const opening = `I am writing to express my strong enthusiasm for the ${role} position at ${company}. With a background in ${topSkills.join(
      ', '
    )}, I am eager to contribute to your engineering organization.`;

    const p1 = topExp
      ? `In my role as ${topExp.role} at ${topExp.company}, I focused on delivering reliable technical solutions. Specifically, I ${
          topExp.highlights[0] || 'spearheaded key engineering initiatives'
        }, which closely aligns with your requirements for ${jobData.requiredSkills.slice(0, 2).join(' and ')}.`
      : `Throughout my career, I have developed expertise across ${topSkills.join(
          ', '
        )}, solving complex problems and collaborating with product teams.`;

    const p2 = `I am drawn to ${company}'s mission and would welcome the opportunity to discuss how my verified background and technical capabilities can deliver immediate impact.`;

    const closing = `Thank you for your consideration. I look forward to speaking with your team.\n\nSincerely,\n${candidateName}`;

    return {
      recipient: `${company} Hiring Team`,
      salutation: `Dear ${company} Hiring Team,`,
      opening,
      bodyParagraphs: [p1, p2],
      closing,
      groundedClaims: topSkills,
      unsupportedClaimsWarning: null,
    };
  }
}
