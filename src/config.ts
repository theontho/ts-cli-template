import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as platformdirs from 'platformdirs';
import { z } from 'zod';

const APP_NAME = 'ts-cli-template';

export const ConfigSchema = z.object({
  logLevel: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
  dataDir: z.string().default(platformdirs.userDataDir(APP_NAME)),
  apiKey: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function getConfigDir(): string {
  return platformdirs.userConfigDir(APP_NAME);
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

export function loadConfig(): Config {
  const path = getConfigPath();
  if (existsSync(path)) {
    try {
      const data = JSON.parse(readFileSync(path, 'utf8'));
      return ConfigSchema.parse(data);
    } catch (e) {
      console.warn(`Warning: Failed to load config from ${path}: ${e}`);
    }
  }
  return ConfigSchema.parse({});
}

export function saveConfig(config: Config): void {
  const path = getConfigPath();
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, JSON.stringify(config, null, 2));
}
