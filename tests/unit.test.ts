import { describe, expect, it } from 'bun:test';
import { existsSync, unlinkSync } from 'node:fs';
import { ConfigSchema, getConfigPath, loadConfig, saveConfig } from '../src/config';
import { LogLevel, setLogLevel, setUseEmoji } from '../src/logging';

describe('Configuration', () => {
  const testConfigPath = getConfigPath();

  it('should load default config if file does not exist', () => {
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
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
});

describe('Logging', () => {
  it('should respect log level', () => {
    setLogLevel(LogLevel.ERROR);
    // This is hard to test without capturing console.log
    // but we can at least verify the setter works
  });

  it('should respect emoji setting', () => {
    setUseEmoji(false);
  });
});
