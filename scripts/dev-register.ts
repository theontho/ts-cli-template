import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';

function getGitConfig(key: string): string {
  const proc = spawnSync('git', ['config', key], { encoding: 'utf8' });
  return proc.status === 0 ? proc.stdout.trim() : '';
}

function getGhIdentity() {
  try {
    const versionProc = spawnSync('gh', ['--version'], { encoding: 'utf8' });
    if (versionProc.status !== 0) return null;

    const apiProc = spawnSync('gh', ['api', 'user'], { encoding: 'utf8' });
    if (apiProc.status !== 0) return null;

    const userInfo = JSON.parse(apiProc.stdout);
    return {
      name: userInfo.name || userInfo.login,
      email: userInfo.email || `${userInfo.login}@users.noreply.github.com`,
      login: userInfo.login
    };
  } catch {
    return null;
  }
}

async function register() {
  const identities: Array<{ source: string; name: string; email: string }> = [];

  // Local Git Identity
  const gitName = getGitConfig('user.name');
  const gitEmail = getGitConfig('user.email');
  if (gitName || gitEmail) {
    identities.push({
      source: 'Local Git Config',
      name: gitName,
      email: gitEmail
    });
  }

  // GitHub Identity
  const ghId = getGhIdentity();
  if (ghId) {
    identities.push({
      source: `GitHub (via gh CLI: ${ghId.login})`,
      name: ghId.name,
      email: ghId.email
    });
  }

  if (identities.length === 0) {
    console.error(chalk.red('❌ No git or GitHub identity found. Please configure git or login to gh.'));
    process.exit(1);
  }

  console.log('Available Identities:');
  for (let i = 0; i < identities.length; i++) {
    console.log(`${i + 1}) ${identities[i].source}: ${identities[i].name} <${identities[i].email}>`);
  }

  process.stdout.write(chalk.blue(`Choose an identity to register in .dev_id (1-${identities.length}) [1]: `));
  
  // Use Bun.stdin for input
  for await (const line of Bun.stdin.stream()) {
    const input = Buffer.from(line).toString().trim() || '1';
    const choice = parseInt(input, 10);
    
    if (isNaN(choice) || choice < 1 || choice > identities.length) {
      console.error(chalk.red('Invalid choice.'));
      process.exit(1);
    }

    const selected = identities[choice - 1];
    const content = `name=${selected.name}\nemail=${selected.email}\n`;
    writeFileSync('.dev_id', content);
    console.log(chalk.green(`✅ Registered in .dev_id using ${selected.source}`));
    process.exit(0);
  }
}

register();
