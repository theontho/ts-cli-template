import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel = LogLevel.INFO;
let useEmoji = process.stdout.isTTY;

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export function setUseEmoji(value: boolean): void {
  useEmoji = value;
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function getLevelName(level: LogLevel): string {
  return LogLevel[level];
}

function formatLog(level: LogLevel, emoji: string, message: string, fileInfo?: string): void {
  if (level < currentLogLevel) return;

  const timestamp = getTimestamp();
  const location = fileInfo ? ` ${fileInfo}` : '';
  const prefix = useEmoji ? emoji : getLevelName(level);
  const output = `[${timestamp}${location}] ${prefix} ${message}`;

  if (level >= LogLevel.WARN) {
    console.error(output);
    return;
  }

  console.log(output);
}

export const log = {
  debug: (message: string, fileInfo?: string) => formatLog(LogLevel.DEBUG, '🐞', message, fileInfo),
  info: (message: string, fileInfo?: string) => formatLog(LogLevel.INFO, 'ℹ️', message, fileInfo),
  warn: (message: string, fileInfo?: string) =>
    formatLog(LogLevel.WARN, '⚠️', chalk.yellow(message), fileInfo),
  error: (message: string, fileInfo?: string) =>
    formatLog(LogLevel.ERROR, '❌', chalk.red(message), fileInfo),
};
