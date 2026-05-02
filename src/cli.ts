#!/usr/bin/env bun

import chalk from 'chalk';
import { Command } from 'commander';
// Bun has built-in support for importing JSON
import packageJson from '../package.json';
import { getConfigPath, loadConfig, saveConfig } from './config.js';
import { LogLevel, log, setLogLevel } from './logging.js';

const program = new Command();

program
  .name('typescript-cli-template')
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
  .command('run')
  .description('Run the main application logic')
  .option('--name <name>', 'name to greet', 'World')
  .action((options) => {
    const config = loadConfig();
    if (program.opts().debug || config.logLevel === 'DEBUG') {
      setLogLevel(LogLevel.DEBUG);
    }

    log.debug('Debug logging is enabled');
    log.info('Starting typescript-cli-template...');
    console.log(chalk.green(`Hello, ${options.name} from Bun!`));
    console.log(`Data directory: ${chalk.cyan(config.dataDir)}`);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
