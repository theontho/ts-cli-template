#!/usr/bin/env bun

import { existsSync } from 'node:fs';
import chalk from 'chalk';
import { Command } from 'commander';
// Bun has built-in support for importing JSON
import packageJson from '../package.json';
import { getConfigPath, loadConfig, saveConfig } from './config.js';
import { LogLevel, log, setLogLevel, setUseEmoji } from './logging.js';

const program = new Command();

program
  .name('ts-cli-template')
  .description('Best-practice Bun-powered TypeScript CLI project template')
  .version(packageJson.version);

program
  .option('--debug', 'enables debug logging')
  .option('--verbose', 'enables verbose logging')
  .option('--quiet', 'suppress all output except errors')
  .option('--no-emoji', 'disable emoji in output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.debug) setLogLevel(LogLevel.DEBUG);
    else if (opts.verbose) setLogLevel(LogLevel.INFO);
    else if (opts.quiet) setLogLevel(LogLevel.ERROR);

    if (opts.emoji === false) setUseEmoji(false);
  });

program
  .command('precheck')
  .description('Check environment and dependencies')
  .action(() => {
    console.log(chalk.blue('Running Pre-check...'));
    let allPassed = true;

    if (!process.versions.bun) {
      log.warn('Running outside of Bun environment');
      allPassed = false;
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
  .action((options) => {
    const path = getConfigPath();
    if (existsSync(path) && !options.force) {
      log.warn(`Config already exists at ${path}. Use --force to overwrite.`);
      return;
    }
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
    // Allow config to override default level if not specified on CLI
    if (!program.opts().debug && !program.opts().verbose && !program.opts().quiet) {
      setLogLevel(LogLevel[config.logLevel as keyof typeof LogLevel]);
    }

    log.debug('Debug logging is enabled');
    log.info('Starting ts-cli-template...');
    console.log(chalk.green(`Hello, ${options.name} from Bun!`));
    console.log(`Data directory: ${chalk.cyan(config.dataDir)}`);
  });

// Global error handling and signal handling
process.on('SIGINT', () => {
  console.log(`\n${chalk.yellow('Interrupted by user')}`);
  process.exit(130);
});

try {
  await program.parseAsync(process.argv);
} catch (err) {
  log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
