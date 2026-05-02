#!/usr/bin/env bun

import chalk from 'chalk';
import { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
// Bun has built-in support for importing JSON
import packageJson from '../package.json';
import { getConfigPath, loadConfig, saveConfig } from './config.js';
import { LogLevel, log, setLogLevel } from './logging.js';

const program = new Command();

program
  .name('ts-cli-template')
  .description('Best-practice Bun-powered TypeScript CLI project template')
  .version(packageJson.version);

program.option('--debug', 'enables debug logging');

program
  .command('precheck')
  .description('Check environment and dependencies')
  .action(() => {
    console.log(chalk.blue('Running Pre-check...'));
    const allPassed = true;

    if (!process.versions.bun) {
      log.warn('Running outside of Bun environment');
    } else {
      log.info(`Bun version ${process.versions.bun} OK`);
    }

    if (allPassed) {
      console.log(chalk.green('Pre-check passed!'));
    } else {
      console.log(chalk.red('Pre-check failed!'));
      process.exit(1);
    }
  });

const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const config = loadConfig();
    console.log(chalk.blue(`Configuration (${getConfigPath()}):`));
    console.table(config);
  });

configCmd
  .command('init')
  .description('Initialize default configuration')
  .option('--force', 'overwrite existing config')
  .action((_options) => {
    const path = getConfigPath();
    const config = loadConfig();
    saveConfig(config);
    log.info(`Initialized config at ${path}`);
  });

program
  .command('dev-register')
  .description('Register your dev identity in .dev_id')
  .action(() => {
    const getGitConfig = (key: string) => {
      const proc = spawnSync('git', ['config', key], { encoding: 'utf8' });
      return proc.status === 0 ? proc.stdout.trim() : '';
    };

    const currentName = getGitConfig('user.name');
    const currentEmail = getGitConfig('user.email');

    console.log(`Current Git Identity: ${currentName} <${currentEmail}>`);
    
    // In a real CLI we would use a prompt library, but for this template simplicity:
    console.log('Registering this identity in .dev_id...');
    const content = `name=${currentName}\nemail=${currentEmail}\n`;
    writeFileSync('.dev_id', content);
    console.log(chalk.green('✅ Registered in .dev_id'));
  });

program
  .command('run')
  .description('Run the main application logic')
  .option('--name <name>', 'name to greet', 'World')
  .action((options) => {
    const config = loadConfig();
    if (program.opts().debug || config.logLevel === 'DEBUG') {
      setLogLevel(LogLevel.DEBUG);
    }

    log.debug('Debug logging is enabled');
    log.info('Starting ts-cli-template...');
    console.log(chalk.green(`Hello, ${options.name} from Bun!`));
    console.log(`Data directory: ${chalk.cyan(config.dataDir)}`);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
