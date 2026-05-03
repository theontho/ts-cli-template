import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { ConfigSchema, getConfigPath, loadConfig, saveConfig } from '../src/config';
import { LogLevel, log, setLogLevel, setUseEmoji } from '../src/logging';

describe('Configuration', () => {
  const testConfigPath = getConfigPath();

  beforeEach(() => {
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
  });

  afterEach(() => {
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
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
    expect(existsSync(testConfigPath)).toBe(true);

    const loaded = loadConfig();
    expect(loaded).toEqual(config);
  });

  it('should fall back gracefully on invalid JSON', () => {
    writeFileSync(testConfigPath, 'invalid-json');
    const config = loadConfig();
    expect(config.logLevel).toBe('INFO');
  });

  it('should reject invalid logLevel via Zod', () => {
    const result = ConfigSchema.safeParse({ logLevel: 'INVALID' });
    expect(result.success).toBe(false);
  });
});

describe('Logging', () => {
  afterEach(() => {
    setLogLevel(LogLevel.INFO);
    setUseEmoji(true);
  });

  it('should respect log level', () => {
    const logSpy = spyOn(console, 'log');

    setLogLevel(LogLevel.ERROR);
    log.info('test info');
    expect(logSpy).not.toHaveBeenCalled();

    log.error('test error');
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should respect emoji setting', () => {
    const logSpy = spyOn(console, 'log');
    setUseEmoji(false);

    log.info('test no emoji');
    // Check that emoji is not in the output. 'ℹ️' is the info emoji.
    expect(logSpy.mock.calls[0]?.[0]).not.toContain('ℹ️');

    logSpy.mockRestore();
  });
});
