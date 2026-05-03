import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';

const isAuto = process.argv.includes('--auto');

function run(command: string, args: string[], required = true, cwd?: string): string | null {
  const proc = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (proc.status !== 0) {
    if (!required) return null;
    const detail = (proc.stderr || proc.stdout).trim();
    throw new Error(detail || `Command failed: ${command} ${args.join(' ')}`);
  }
  return proc.stdout.trim();
}

function skipAuto(reason: string): void {
  if (isAuto) console.log(chalk.gray(`Skipping Lefthook install: ${reason}`));
}

function setupHooks() {
  if (isAuto && process.env.CI === 'true') {
    skipAuto('CI environment');
    return;
  }

  const repoRoot = run('git', ['rev-parse', '--show-toplevel'], !isAuto);
  if (!repoRoot) {
    skipAuto('not inside a Git repository');
    return;
  }

  const configPath = join(repoRoot, 'lefthook.yml');
  if (!existsSync(configPath)) {
    if (isAuto) {
      skipAuto(`missing config at ${configPath}`);
      return;
    }

    throw new Error(`Missing Lefthook config at ${configPath}`);
  }

  run('bun', ['x', 'lefthook', 'install'], true, repoRoot);
  if (!isAuto) {
    console.log(chalk.green('✅ Installed pre-commit and pre-push hooks via Lefthook'));
  }
}

try {
  setupHooks();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`❌ ${message}`));
  process.exit(1);
}
