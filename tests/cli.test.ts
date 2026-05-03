import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG_DIR_ENV } from '../src/config';

function runCli(args: string[], configDir: string) {
  return spawnSync('bun', ['./src/cli.ts', ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      [CONFIG_DIR_ENV]: configDir,
      FORCE_COLOR: '0',
    },
  });
}

describe('CLI Integration', () => {
  let configDir: string;
  let configPath: string;

  beforeEach(() => {
    mkdirSync('tmp', { recursive: true });
    configDir = mkdtempSync(join(process.cwd(), 'tmp', 'cli-config-test-'));
    configPath = join(configDir, 'config.json');
  });

  afterEach(() => {
    rmSync(configDir, { recursive: true, force: true });
  });

  it('should show help output', () => {
    const proc = runCli(['--help'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout).toContain('Usage: ts-cli-template');
  });

  it('should show version', () => {
    const proc = runCli(['--version'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should run precheck', () => {
    const proc = runCli(['precheck'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout).toContain('Pre-check passed!');
  });

  it('should initialize config', () => {
    const proc = runCli(['config', 'init', '--force'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout).toContain('Initialized config at');
    expect(existsSync(configPath)).toBe(true);
  });

  it('should force initialize fresh default config', () => {
    writeFileSync(
      configPath,
      JSON.stringify({ logLevel: 'DEBUG', dataDir: '/tmp/old', apiKey: 'secret' }),
    );
    const proc = runCli(['config', 'init', '--force'], configDir);
    expect(proc.status).toBe(0);

    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    expect(config.logLevel).toBe('INFO');
    expect(config.apiKey).toBeUndefined();
  });

  it('should show config', () => {
    const proc = runCli(['config', 'show'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout).toContain('Configuration');
  });

  it('should redact secrets when showing config', () => {
    writeFileSync(
      configPath,
      JSON.stringify({ logLevel: 'INFO', dataDir: '/tmp/test-data', apiKey: 'super-secret' }),
    );
    const proc = runCli(['config', 'show'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout).toContain('<redacted>');
    expect(proc.stdout).not.toContain('super-secret');
  });

  it('should fail on invalid existing config', () => {
    writeFileSync(configPath, 'invalid-json');
    const proc = runCli(['run'], configDir);
    expect(proc.status).toBe(1);
    expect(proc.stderr).toContain('ERROR Failed to load config');
  });

  it('should run with custom name', () => {
    const proc = runCli(['run', '--name', 'Tester'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout).toContain('Hello, Tester from Bun!');
  });

  it('should respect --quiet flag', () => {
    const proc = runCli(['run', '--quiet'], configDir);
    expect(proc.status).toBe(0);
    expect(proc.stdout).not.toContain('Starting ts-cli-template');
    expect(proc.stdout).not.toContain('Hello, World from Bun!');
  });

  it('should reject conflicting verbosity flags', () => {
    const proc = runCli(['--debug', '--quiet', 'run'], configDir);
    expect(proc.status).toBe(1);
    expect(proc.stderr).toContain('Choose only one of --debug, --verbose, or --quiet');
  });
});
