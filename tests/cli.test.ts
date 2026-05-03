import { afterEach, describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { getConfigPath } from '../src/config';

describe('CLI Integration', () => {
  const configPath = getConfigPath();

  afterEach(() => {
    // We don't necessarily want to delete the user's real config
    // in a real development environment, but for a template's tests
    // it's often necessary to ensure a clean state.
  });

  it('should show help output', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', '--help'], { encoding: 'utf8' });
    expect(proc.stdout).toContain('Usage: ts-cli-template');
  });

  it('should show version', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', '--version'], { encoding: 'utf8' });
    expect(proc.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should run precheck', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', 'precheck'], { encoding: 'utf8' });
    expect(proc.stdout).toContain('Pre-check passed!');
  });

  it('should initialize config', () => {
    // If config exists, we need to test --force or handle it
    const proc = spawnSync('bun', ['./src/cli.ts', 'config', 'init', '--force'], {
      encoding: 'utf8',
    });
    expect(proc.stdout).toContain('Initialized config at');
    expect(existsSync(configPath)).toBe(true);
  });

  it('should show config', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', 'config', 'show'], { encoding: 'utf8' });
    expect(proc.stdout).toContain('Configuration');
  });

  it('should run with custom name', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', 'run', '--name', 'Tester'], {
      encoding: 'utf8',
    });
    expect(proc.stdout).toContain('Hello, Tester from Bun!');
  });

  it('should respect --quiet flag', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', 'run', '--quiet'], { encoding: 'utf8' });
    // In quiet mode, log.info (ℹ️) should be suppressed
    expect(proc.stdout).not.toContain('ℹ️');
    expect(proc.stdout).toContain('Hello, World from Bun!');
  });
});
