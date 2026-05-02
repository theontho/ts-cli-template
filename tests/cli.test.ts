import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('CLI', () => {
  it('should show help output', () => {
    const output = execSync('node dist/cli.js --help').toString();
    expect(output).toContain('Usage: typescript-cli-template');
  });

  it('should run precheck', () => {
    const output = execSync('node dist/cli.js precheck').toString();
    expect(output).toContain('Pre-check passed!');
  });
});
