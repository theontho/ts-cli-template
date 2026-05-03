import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';

function run(command: string, args: string[]): string {
  const proc = spawnSync(command, args, { encoding: 'utf8' });
  if (proc.status !== 0) {
    const detail = (proc.stderr || proc.stdout).trim();
    throw new Error(detail || `Command failed: ${command} ${args.join(' ')}`);
  }
  return proc.stdout.trim();
}

function setupHooks() {
  const repoRoot = run('git', ['rev-parse', '--show-toplevel']);
  const configPath = join(repoRoot, 'lefthook.yml');
  if (!existsSync(configPath)) {
    throw new Error(`Missing Lefthook config at ${configPath}`);
  }

  run('bun', ['x', 'lefthook', 'install']);
  console.log(chalk.green('✅ Installed pre-commit and pre-push hooks via Lefthook'));
}

try {
  setupHooks();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`❌ ${message}`));
  process.exit(1);
}
