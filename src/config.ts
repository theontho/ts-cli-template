import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import * as platformdirs from 'platformdirs';
import { z } from 'zod';

const APP_NAME = 'ts-cli-template';
export const CONFIG_DIR_ENV = 'TS_CLI_TEMPLATE_CONFIG_DIR';

export const ConfigSchema = z.object({
  logLevel: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
  dataDir: z
    .string()
    .trim()
    .min(1)
    .refine((value) => isAbsolute(value), 'dataDir must be an absolute path')
    .default(platformdirs.userDataDir(APP_NAME)),
  apiKey: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function defaultConfig(): Config {
  return ConfigSchema.parse({});
}

export function getConfigDir(): string {
  const override = process.env[CONFIG_DIR_ENV];
  if (override) return override;
  return platformdirs.userConfigDir(APP_NAME);
}

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

export function loadConfig(): Config {
  const path = getConfigPath();
  if (!existsSync(path)) {
    return defaultConfig();
  }

  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return ConfigSchema.parse(data);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load config from ${path}: ${detail}`);
  }
}

export function saveConfig(config: Config): void {
  const path = getConfigPath();
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  const validated = ConfigSchema.parse(config);
  const tempPath = join(dir, `.config.${process.pid}.${Date.now()}.tmp`);
  writeFileSync(tempPath, `${JSON.stringify(validated, null, 2)}\n`, { mode: 0o600 });
  renameSync(tempPath, path);
}
