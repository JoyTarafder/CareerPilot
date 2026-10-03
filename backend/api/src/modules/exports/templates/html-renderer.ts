import { ResumeContentSnapshot } from '@careerpilot/contracts';

function escapeHtml(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderResumeToHtml(resume: ResumeContentSnapshot): string {
  const { personalInfo, summary, educations, experiences, projects, skills, template } = resume;

  const fontFamilies = {
    Foundation: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    Editorial: '"Source Serif 4", Georgia, Cambria, "Times New Roman", Times, serif',
    Technical: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const selectedFont = fontFamilies[template] || fontFamilies.Foundation;
  const isEditorial = template === 'Editorial';
  const isTechnical = template === 'Technical';

  const contactItems: string[] = [
    escapeHtml(personalInfo.email),
    escapeHtml(personalInfo.phoneNumber),
    escapeHtml(personalInfo.location),
    personalInfo.portfolioUrl ? `<a href="${escapeHtml(personalInfo.portfolioUrl)}" style="color: #175C4C; text-decoration: none;">Portfolio</a>` : '',
    personalInfo.githubUrl ? `<a href="${escapeHtml(personalInfo.githubUrl)}" style="color: #175C4C; text-decoration: none;">GitHub</a>` : '',
    personalInfo.linkedinUrl ? `<a href="${escapeHtml(personalInfo.linkedinUrl)}" style="color: #175C4C; text-decoration: none;">LinkedIn</a>` : '',
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(personalInfo.fullName)} — Resume</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: ${selectedFont};
      color: #171A19;
      background-color: #FFFFFF;
      font-size: 10.5pt;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      border-bottom: ${isEditorial ? '2px solid #171A19' : '1px solid #DDE2DC'};
      padding-bottom: 12px;
      margin-bottom: 16px;
      ${isEditorial ? 'text-align: center;' : ''}
    }
    .name {
      font-size: ${isEditorial ? '24pt' : '20pt'};
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 6px 0;
      color: #171A19;
    }
    .contact-bar {
      font-size: 9pt;
      color: #454B48;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      ${isEditorial ? 'justify-content: center;' : ''}
    }
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 11.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${isTechnical ? '#175C4C' : '#171A19'};
      border-bottom: 1px solid #DDE2DC;
      padding-bottom: 3px;
      margin: 0 0 8px 0;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .item-title {
      font-weight: 650;
      font-size: 10.5pt;
      color: #171A19;
    }
    .item-subtitle {
      font-size: 9.5pt;
      color: #454B48;
      margin-bottom: 4px;
    }
    .item-date {
      font-size: 9pt;
      color: #454B48;
      white-space: nowrap;
    }
    ul {
      margin: 4px 0 8px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 3px;
      font-size: 10pt;
    }
    .tech-tag {
      display: inline-block;
      font-size: 8.5pt;
      padding: 1px 6px;
      background-color: #F3F5F1;
      border: 1px solid #DDE2DC;
      border-radius: 4px;
      margin-right: 4px;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1 class="name">${escapeHtml(personalInfo.fullName)}</h1>
    <div class="contact-bar">
      ${contactItems.map((item) => `<span>${item}</span>`).join(' • ')}
    </div>
  </header>

  ${
    summary
      ? `<section class="section">
    <h2 class="section-title">Professional Summary</h2>
    <p style="margin: 0; font-size: 10pt;">${escapeHtml(summary)}</p>
  </section>`
      : ''
  }

  ${
    skills && skills.length > 0
      ? `<section class="section">
    <h2 class="section-title">Skills</h2>
    <div style="font-size: 10pt;">
      ${skills
        .map(
          (group) =>
            `<div style="margin-bottom: 4px;"><strong>${escapeHtml(group.category)}:</strong> ${escapeHtml(group.items.join(', '))}</div>`
        )
        .join('')}
    </div>
  </section>`
      : ''
  }

  ${
    experiences && experiences.length > 0
      ? `<section class="section">
    <h2 class="section-title">Experience</h2>
    ${experiences
      .map(
        (exp) => `
      <div style="margin-bottom: 10px;">
        <div class="item-header">
          <span class="item-title">${escapeHtml(exp.role)} — ${escapeHtml(exp.company)}</span>
          <span class="item-date">${escapeHtml(exp.startDate)} – ${exp.isCurrent ? 'Present' : escapeHtml(exp.endDate)}</span>
        </div>
        ${exp.location ? `<div class="item-subtitle">${escapeHtml(exp.location)}</div>` : ''}
        ${exp.description ? `<p style="margin: 2px 0 4px; font-size: 10pt;">${escapeHtml(exp.description)}</p>` : ''}
        ${
          exp.highlights && exp.highlights.length > 0
            ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
            : ''
        }
      </div>
    `
      )
      .join('')}
  </section>`
      : ''
  }

  ${
    projects && projects.length > 0
      ? `<section class="section">
    <h2 class="section-title">Projects</h2>
    ${projects
      .map(
        (proj) => `
      <div style="margin-bottom: 8px;">
        <div class="item-header">
          <span class="item-title">${escapeHtml(proj.title)}</span>
          ${proj.url ? `<span class="item-date"><a href="${escapeHtml(proj.url)}" style="color: #175C4C; text-decoration: none;">View Project</a></span>` : ''}
        </div>
        ${proj.description ? `<p style="margin: 2px 0; font-size: 10pt;">${escapeHtml(proj.description)}</p>` : ''}
        ${
          proj.technologies && proj.technologies.length > 0
            ? `<div>${proj.technologies.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>`
            : ''
        }
      </div>
    `
      )
      .join('')}
  </section>`
      : ''
  }

  ${
    educations && educations.length > 0
      ? `<section class="section">
    <h2 class="section-title">Education</h2>
    ${educations
      .map(
        (edu) => `
      <div style="margin-bottom: 8px;">
        <div class="item-header">
          <span class="item-title">${escapeHtml(edu.degree)} in ${escapeHtml(edu.fieldOfStudy)}</span>
          <span class="item-date">${escapeHtml(edu.startDate)} – ${edu.isCurrent ? 'Present' : escapeHtml(edu.endDate)}</span>
        </div>
        <div class="item-subtitle">${escapeHtml(edu.institution)}</div>
        ${edu.description ? `<p style="margin: 2px 0; font-size: 10pt;">${escapeHtml(edu.description)}</p>` : ''}
      </div>
    `
      )
      .join('')}
  </section>`
      : ''
  }
</body>
</html>`;
}
