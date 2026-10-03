import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateMatch, DEFAULT_SCORING_RULESET_V1 } from '../src/index.js';

describe('Deterministic Scoring Engine', () => {
  it('returns repeatable scores for identical inputs', () => {
    const input = {
      resume: {
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        experienceYears: 3,
        educationDegrees: ['BSc Computer Science'],
        keywords: ['REST', 'CI/CD', 'Docker'],
      },
      job: {
        requiredSkills: ['TypeScript', 'React', 'Node.js'],
        preferredSkills: ['PostgreSQL', 'AWS'],
        minExperienceYears: 2,
        requiredDegrees: ['BSc Computer Science'],
        keywords: ['REST', 'Docker'],
      },
      rules: DEFAULT_SCORING_RULESET_V1,
    };

    const run1 = calculateMatch(input);
    const run2 = calculateMatch(input);

    assert.strictEqual(run1.score, run2.score);
    assert.deepStrictEqual(run1.categories, run2.categories);
    assert.strictEqual(run1.scoringVersion, '1.0.0');
    assert.strictEqual(run1.missingRequirements.length, 1); // AWS is missing
    assert.strictEqual(run1.missingRequirements[0]?.title, 'AWS');
  });

  it('marks required skills as missing when not present in resume', () => {
    const input = {
      resume: {
        skills: ['JavaScript'],
        experienceYears: 1,
        educationDegrees: [],
        keywords: [],
      },
      job: {
        requiredSkills: ['Python', 'Django'],
        preferredSkills: [],
        minExperienceYears: 3,
        requiredDegrees: ['BSc Computer Science'],
        keywords: [],
      },
      rules: DEFAULT_SCORING_RULESET_V1,
    };

    const result = calculateMatch(input);
    assert.strictEqual(result.categories.requiredSkills, 0);
    assert.strictEqual(result.missingRequirements.length, 4);
    const requiredSkillsMissing = result.missingRequirements.filter((r) => r.category === 'requiredSkill');
    assert.strictEqual(requiredSkillsMissing.length, 2);
  });
});
