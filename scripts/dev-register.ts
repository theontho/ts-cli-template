import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import chalk from 'chalk';

function getGitConfig(key: string): string {
  const proc = spawnSync('git', ['config', key], { encoding: 'utf8' });
  return proc.status === 0 ? proc.stdout.trim() : '';
}

function register() {
  const currentName = getGitConfig('user.name');
  const currentEmail = getGitConfig('user.email');

  console.log(`Current Git Identity: ${currentName} <${currentEmail}>`);
  console.log('Registering this identity in .dev_id...');
  const content = `name=${currentName}\nemail=${currentEmail}\n`;
  writeFileSync('.dev_id', content);
  console.log(chalk.green('✅ Registered in .dev_id'));
}

register();
