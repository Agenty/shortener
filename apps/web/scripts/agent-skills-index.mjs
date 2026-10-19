// Writes public/.well-known/agent-skills/index.json with the SHA-256 digest of
// each SKILL.md, per the Agent Skills Discovery draft (v0.2.0). Runs before build.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../public/.well-known/agent-skills/', import.meta.url));

const skills = [{ name: 'shortener-dev', file: 'SKILL.md' }].map(({ name, file }) => {
  const bytes = readFileSync(dir + file);
  const description = bytes
    .toString('utf8')
    .match(/^description:\s*(.+)$/m)[1]
    .trim();
  return {
    name,
    type: 'skill-md',
    description,
    url: `/.well-known/agent-skills/${file}`,
    digest: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
  };
});

const index = { $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json', skills };
writeFileSync(dir + 'index.json', `${JSON.stringify(index, null, 2)}\n`);
console.log(`agent-skills: wrote ${skills.length} skill(s) to index.json`);
