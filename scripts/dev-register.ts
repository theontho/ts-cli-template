import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';

function getGitConfig(key: string): string {
  const proc = spawnSync('git', ['config', key], { encoding: 'utf8' });
  return proc.status === 0 ? proc.stdout.trim() : '';
}

function getGhIdentities() {
  const identities: Array<{ source: string; name: string; email: string; login: string }> = [];
  try {
    const versionProc = spawnSync('gh', ['--version'], { encoding: 'utf8' });
    if (versionProc.status !== 0) return identities;

    const statusProc = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
    const output = statusProc.stdout + statusProc.stderr;
    
    const regex = /Logged in to .+ account ([^\s\(]+)/g;
    let match;
    const usernames = new Set<string>();
    
    while ((match = regex.exec(output)) !== null) {
      usernames.add(match[1]);
    }

    for (const username of usernames) {
      try {
        const apiProc = spawnSync('gh', ['api', 'users/' + username], { encoding: 'utf8' });
        if (apiProc.status === 0) {
          const userInfo = JSON.parse(apiProc.stdout);
          identities.push({
            source: 'GitHub (account: ' + username + ')',
            name: userInfo.name || userInfo.login,
            email: userInfo.email || userInfo.login + '@users.noreply.github.com',
            login: userInfo.login
          });
        } else {
           identities.push({
            source: 'GitHub (account: ' + username + ' - details unavailable)',
            name: username,
            email: username + '@users.noreply.github.com',
            login: username
          });
        }
      } catch {
        // Fallback
      }
    }
  } catch {
    // Ignore errors
  }
  return identities;
}

async function register() {
  const allIdentities: Array<{ source: string; name: string; email: string }> = [];

  const gitName = getGitConfig('user.name');
  const gitEmail = getGitConfig('user.email');
  if (gitName || gitEmail) {
    allIdentities.push({
      source: 'Local Git Config',
      name: gitName,
      email: gitEmail
    });
  }

  const ghIdentities = getGhIdentities();
  allIdentities.push(...ghIdentities);

  if (allIdentities.length === 0) {
    console.error(chalk.red('❌ No git or GitHub identity found. Please configure git or login to gh.'));
    process.exit(1);
  }

  console.log('Available Identities:');
  for (let i = 0; i < allIdentities.length; i++) {
    console.log((i + 1) + ') ' + allIdentities[i].source + ': ' + allIdentities[i].name + ' <' + allIdentities[i].email + '>');
  }

  process.stdout.write(chalk.blue('Choose an identity to register in .dev_id (1-' + allIdentities.length + ') [1]: '));
  
  for await (const line of (Bun.stdin as any).stream()) {
    const input = Buffer.from(line).toString().trim() || '1';
    const choice = parseInt(input, 10);
    
    if (isNaN(choice) || choice < 1 || choice > allIdentities.length) {
      console.error(chalk.red('Invalid choice.'));
      process.exit(1);
    }

    const selected = allIdentities[choice - 1];
    const content = 'name=' + selected.name + '\nemail=' + selected.email + '\n';
    writeFileSync('.dev_id', content);
    console.log(chalk.green('✅ Registered in .dev_id using ' + selected.source));
    process.exit(0);
  }
}

register();
