#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { Command } from 'commander';
import { getConfigPath, loadConfig, saveConfig } from './config.js';
import { LogLevel, log, setLogLevel } from './logging.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('typescript-cli-template')
  .description('Best-practice TypeScript CLI project template')
  .version(packageJson.version);

program.option('--debug', 'enables debug logging');

program
  .command('precheck')
  .description('Check environment and dependencies')
  .action(() => {
    console.log(chalk.blue('Running Pre-check...'));
    let allPassed = true;

    if (process.version.startsWith('v')) {
      const major = parseInt(process.version.slice(1).split('.')[0], 10);
      if (major < 20) {
        log.error(`Node.js 20+ required, found ${process.version}`);
        allPassed = false;
      } else {
        log.info(`Node.js version ${process.version} OK`);
      }
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
    console.log(chalk.green(`Hello, ${options.name} from TypeScript!`));
    console.log(`Data directory: ${chalk.cyan(config.dataDir)}`);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
