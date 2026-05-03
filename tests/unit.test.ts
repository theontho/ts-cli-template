import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Identity, orderIdentities, parseGhAuthStatus } from '../scripts/dev-register';
import { CONFIG_DIR_ENV, ConfigSchema, getConfigPath, loadConfig, saveConfig } from '../src/config';
import { LogLevel, log, setLogLevel, setUseEmoji } from '../src/logging';

describe('Configuration', () => {
  let testConfigDir: string;

  beforeEach(() => {
    mkdirSync('tmp', { recursive: true });
    testConfigDir = mkdtempSync(join(process.cwd(), 'tmp', 'config-test-'));
    process.env[CONFIG_DIR_ENV] = testConfigDir;
  });

  afterEach(() => {
    delete process.env[CONFIG_DIR_ENV];
    rmSync(testConfigDir, { recursive: true, force: true });
  });

  it('should load default config if file does not exist', () => {
    const config = loadConfig();
    expect(config.logLevel).toBe('INFO');
    expect(config.dataDir).toBeDefined();
  });

  it('should round-trip config saving and loading', () => {
    const config = ConfigSchema.parse({
      logLevel: 'DEBUG',
      dataDir: '/tmp/test-data',
      apiKey: 'test-key',
    });

    saveConfig(config);
    const testConfigPath = getConfigPath();
    expect(existsSync(testConfigPath)).toBe(true);
    expect(readFileSync(testConfigPath, 'utf8')).toContain('"apiKey": "test-key"');

    const loaded = loadConfig();
    expect(loaded).toEqual(config);
  });

  it('should fail on invalid JSON in an existing config file', () => {
    const testConfigPath = getConfigPath();
    writeFileSync(testConfigPath, 'invalid-json');
    expect(() => loadConfig()).toThrow('Failed to load config');
  });

  it('should reject invalid logLevel via Zod', () => {
    const result = ConfigSchema.safeParse({ logLevel: 'INVALID' });
    expect(result.success).toBe(false);
  });
});

describe('Logging', () => {
  afterEach(() => {
    setLogLevel(LogLevel.INFO);
    setUseEmoji(process.stdout.isTTY);
  });

  it('should respect log level', () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

    setLogLevel(LogLevel.ERROR);
    log.info('test info');
    expect(logSpy).not.toHaveBeenCalled();

    log.error('test error');
    expect(errorSpy).toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should use level names when emoji is disabled', () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    setUseEmoji(false);

    log.info('test no emoji');
    expect(logSpy.mock.calls[0]?.[0]).toContain('INFO test no emoji');
    expect(logSpy.mock.calls[0]?.[0]).not.toContain('ℹ️');

    logSpy.mockRestore();
  });

  it('should use emoji instead of level names when emoji is enabled', () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    setUseEmoji(true);

    log.info('test emoji');
    expect(logSpy.mock.calls[0]?.[0]).toContain('ℹ️ test emoji');
    expect(logSpy.mock.calls[0]?.[0]).not.toContain('INFO');

    logSpy.mockRestore();
  });
});

describe('Developer identity registration', () => {
  it('should parse the active GitHub account from gh auth status output', () => {
    const accounts = parseGhAuthStatus(`github.com
  ✓ Logged in to github.com account theontho (keyring)
  - Active account: true

  ✓ Logged in to github.com account warkingtime (keyring)
  - Active account: false
`);

    expect(accounts).toEqual([
      { login: 'theontho', active: true },
      { login: 'warkingtime', active: false },
    ]);
  });

  it('should prefer the active GitHub identity when it matches local git config', () => {
    const gitIdentity: Identity = {
      source: 'Local Git Config',
      name: 'Mahyar McDonald',
      email: '22130+theontho@users.noreply.github.com',
    };

    const identities = orderIdentities(gitIdentity, [
      {
        source: 'GitHub active account (theontho)',
        name: 'Mac',
        email: 'theontho@users.noreply.github.com',
        login: 'theontho',
        active: true,
      },
      {
        source: 'GitHub account (warkingtime)',
        name: 'warkingtime',
        email: 'warkingtime@users.noreply.github.com',
        login: 'warkingtime',
      },
    ]);

    expect(identities[0]).toEqual({
      source: 'GitHub active account (theontho) via Local Git Config',
      name: 'Mahyar McDonald',
      email: '22130+theontho@users.noreply.github.com',
      login: 'theontho',
      active: true,
    });
  });

  it('should fall back to local git identity when gh identities are unavailable', () => {
    const gitIdentity: Identity = {
      source: 'Local Git Config',
      name: 'Local User',
      email: 'local@example.com',
    };

    expect(orderIdentities(gitIdentity, [])).toEqual([gitIdentity]);
  });
});
