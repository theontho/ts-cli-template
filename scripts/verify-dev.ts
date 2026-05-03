import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function getGitConfig(key: string): string | null {
  const proc = spawnSync('git', ['config', key], { encoding: 'utf8' });
  if (proc.status === 0) {
    return proc.stdout.trim();
  }
  return null;
}

function verify() {
  const devIdPath = '.dev_id';
  if (!existsSync(devIdPath)) {
    console.error('❌ Error: .dev_id file not found!');
    console.error("Please run 'ts-cli-template dev-register' to set up your identity.");
    process.exit(1);
  }

  const expected: Record<string, string> = {};
  const content = readFileSync(devIdPath, 'utf8');
  for (const line of content.split('\n')) {
    const idx = line.indexOf('=');
    if (idx !== -1) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim();
      expected[k] = v;
    }
  }

  const currentName = getGitConfig('user.name');
  const currentEmail = getGitConfig('user.email');

  const errors: string[] = [];
  if (currentName !== expected.name) {
    errors.push(`Expected name '${expected.name}', found '${currentName}'`);
  }
  if (currentEmail !== expected.email) {
    errors.push(`Expected email '${expected.email}', found '${currentEmail}'`);
  }

  if (errors.length > 0) {
    console.error('❌ Git identity mismatch!');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error('\nPlease update your git config or .dev_id file.');
    process.exit(1);
  }

  console.log('✅ Git identity verified.');
}

verify();
