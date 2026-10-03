/**
 * Pure dictionary normalizer resolving synonyms, shorthands, and tool aliases.
 */
const ALIAS_MAP: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  node: 'node.js',
  nodejs: 'node.js',
  reactjs: 'react',
  'react.js': 'react',
  nextjs: 'next.js',
  'next.js': 'next.js',
  vuejs: 'vue',
  'vue.js': 'vue',
  postgres: 'postgresql',
  pgsql: 'postgresql',
  mongo: 'mongodb',
  k8s: 'kubernetes',
  py: 'python',
  python3: 'python',
  golang: 'go',
  'amazon web services': 'aws',
  'google cloud': 'gcp',
  'google cloud platform': 'gcp',
  gql: 'graphql',
  cicd: 'ci/cd',
  'continuous integration': 'ci/cd',
  'tailwind css': 'tailwindcss',
  tailwind: 'tailwindcss',
  expressjs: 'express',
  'express.js': 'express',
};

export function normalizeSkill(skill: string): string {
  const cleaned = skill.toLowerCase().trim();
  return ALIAS_MAP[cleaned] || cleaned;
}
