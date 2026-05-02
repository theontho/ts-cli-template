import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';

describe('CLI', () => {
  it('should show help output', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', '--help'], { encoding: 'utf8' });
    expect(proc.stdout).toContain('Usage: typescript-cli-template');
  });

  it('should run precheck', () => {
    const proc = spawnSync('bun', ['./src/cli.ts', 'precheck'], { encoding: 'utf8' });
    expect(proc.stdout).toContain('Pre-check passed!');
  });
});
