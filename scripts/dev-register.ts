import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';

export type Identity = {
  source: string;
  name: string;
  email: string;
  login?: string;
  active?: boolean;
};

type GhAccount = {
  login: string;
  active: boolean;
};

function getGitConfig(key: string): string {
  const proc = spawnSync('git', ['config', key], { encoding: 'utf8' });
  return proc.status === 0 ? proc.stdout.trim() : '';
}

export function parseGhAuthStatus(output: string): GhAccount[] {
  const accounts: GhAccount[] = [];
  let current: GhAccount | undefined;

  for (const line of output.split(/\r?\n/)) {
    const login = line.match(/Logged in to github\.com account ([^\s(]+)/)?.[1];
    if (login) {
      current = { login, active: false };
      accounts.push(current);
      continue;
    }

    const active = line.match(/Active account:\s*(true|false)/)?.[1];
    if (current && active) current.active = active === 'true';
  }

  return accounts;
}

function getGitIdentity(): Identity | null {
  const gitName = getGitConfig('user.name');
  const gitEmail = getGitConfig('user.email');
  if (!gitName || !gitEmail) return null;

  return {
    source: 'Local Git Config',
    name: gitName,
    email: gitEmail,
  };
}

function getJsonFromGh(args: string[]): Record<string, unknown> | null {
  const proc = spawnSync('gh', ['api', ...args], { encoding: 'utf8' });
  if (proc.status !== 0) return null;

  try {
    return JSON.parse(proc.stdout) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function buildGhEmail(userInfo: Record<string, unknown>, login: string): string {
  const publicEmail = getString(userInfo.email);
  if (publicEmail) return publicEmail;

  const id = typeof userInfo.id === 'number' ? userInfo.id : null;
  return id ? `${id}+${login}@users.noreply.github.com` : `${login}@users.noreply.github.com`;
}

function getGhIdentities(): Identity[] {
  const identities: Identity[] = [];
  try {
    const versionProc = spawnSync('gh', ['--version'], { encoding: 'utf8' });
    if (versionProc.status !== 0) return identities;

    const statusProc = spawnSync('gh', ['auth', 'status', '--hostname', 'github.com'], {
      encoding: 'utf8',
    });
    const output = statusProc.stdout + statusProc.stderr;
    const accounts = parseGhAuthStatus(output);
    const activeUser = getJsonFromGh(['user']);
    const activeLogin =
      getString(activeUser?.login) ?? accounts.find((account) => account.active)?.login;

    const usernames = new Set<string>();
    if (activeLogin) usernames.add(activeLogin);
    for (const account of accounts) {
      usernames.add(account.login);
    }

    for (const username of usernames) {
      try {
        const userInfo =
          username === activeLogin && activeUser
            ? activeUser
            : getJsonFromGh([`users/${username}`]);
        if (userInfo) {
          const login = getString(userInfo.login) ?? username;
          identities.push({
            source: `GitHub${username === activeLogin ? ' active' : ''} account (${username})`,
            name: getString(userInfo.name) ?? login,
            email: buildGhEmail(userInfo, login),
            login,
            active: username === activeLogin,
          });
        } else {
          identities.push({
            source: `GitHub${username === activeLogin ? ' active' : ''} account (${username} - details unavailable)`,
            name: username,
            email: `${username}@users.noreply.github.com`,
            login: username,
            active: username === activeLogin,
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

function identityKey(identity: Identity): string {
  return `${identity.name}\0${identity.email}`;
}

function gitIdentityMatchesGh(gitIdentity: Identity, ghIdentity: Identity): boolean {
  if (!ghIdentity.login) return false;
  return gitIdentity.email.toLowerCase().includes(ghIdentity.login.toLowerCase());
}

export function orderIdentities(
  gitIdentity: Identity | null,
  ghIdentities: Identity[],
): Identity[] {
  const ordered: Identity[] = [];
  const seen = new Set<string>();
  const add = (identity: Identity) => {
    const key = identityKey(identity);
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(identity);
  };

  const activeGh = ghIdentities.find((identity) => identity.active);
  if (activeGh) {
    if (gitIdentity && activeGh.login && gitIdentityMatchesGh(gitIdentity, activeGh)) {
      add({
        ...gitIdentity,
        source: `GitHub active account (${activeGh.login}) via Local Git Config`,
        login: activeGh.login,
        active: true,
      });
    } else {
      add(activeGh);
    }
  }

  for (const identity of ghIdentities) {
    add(identity);
  }

  if (gitIdentity) add(gitIdentity);

  return ordered;
}

async function register() {
  const gitIdentity = getGitIdentity();
  const ghIdentities = getGhIdentities();
  const allIdentities = orderIdentities(gitIdentity, ghIdentities);

  if (allIdentities.length === 0) {
    console.error(
      chalk.red('❌ No git or GitHub identity found. Please configure git or login to gh.'),
    );
    process.exit(1);
  }

  console.log('Available Identities:');
  for (let i = 0; i < allIdentities.length; i++) {
    const identity = allIdentities[i];
    if (!identity) continue;
    console.log(`${i + 1}) ${identity.source}: ${identity.name} <${identity.email}>`);
  }

  if (!process.stdin.isTTY) {
    const selected = allIdentities[0];
    if (!selected) {
      console.error(chalk.red('No identity available to register.'));
      process.exit(1);
    }

    writeFileSync('.dev_id', `name=${selected.name}\nemail=${selected.email}\n`);
    console.log(chalk.green(`✅ Registered in .dev_id using ${selected.source}`));
    return;
  }

  process.stdout.write(
    chalk.blue(`Choose an identity to register in .dev_id (1-${allIdentities.length}) [1]: `),
  );

  for await (const line of Bun.stdin.stream()) {
    const input = Buffer.from(line).toString().trim() || '1';
    const choice = parseInt(input, 10);

    if (Number.isNaN(choice) || choice < 1 || choice > allIdentities.length) {
      console.error(chalk.red('Invalid choice.'));
      process.exit(1);
    }

    const selected = allIdentities[choice - 1];
    if (!selected) {
      console.error(chalk.red('Invalid choice.'));
      process.exit(1);
    }
    const content = `name=${selected.name}\nemail=${selected.email}\n`;
    writeFileSync('.dev_id', content);
    console.log(chalk.green(`✅ Registered in .dev_id using ${selected.source}`));
    process.exit(0);
  }
}

if (import.meta.main) {
  await register();
}
