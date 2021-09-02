import * as app from '..';
import * as ncm from '@nestjs/common';
import os from 'os';
import path from 'path';

@ncm.Injectable()
export class LoggerService implements ncm.LoggerService {
  private readonly fileService: app.FileService;
  private readonly queue: Array<string>;
  private isRunning: boolean;

  constructor(fileService: app.FileService) {
    this.isRunning = false;
    this.fileService = fileService;
    this.queue = [];
  }

  debug(value: string) {
    this.enqueue('DEBUG', fetchMessage(value));
  }
  
  error(value: Error | string, trace?: string) {
    this.enqueue('ERROR', fetchMessage(value, trace));
  }

  info(value: string) {
    showMessage(value);
    this.enqueue('INFO', fetchMessage(value));
  }

  log(value: string) {
    showMessage(value);
    this.enqueue('LOG', fetchMessage(value));
  }
  
  verbose(value: string) {
    this.enqueue('DEBUG', fetchMessage(value));
  }

  warn(value: string) {
    this.enqueue('WARN', fetchMessage(value));
  }

  private enqueue(level: string, line: string) {
    this.queue.push(`[${new Date().toISOString()}] ${level.padEnd(5)} ${line}`);
    this.tryRun();
  }

  private async runAsync() {
    const filePath = path.join(app.settings.path.logger, `${new Date().toISOString().substr(0, 10)}.log`);
    while (this.queue.length) await this.fileService.appendAsync(filePath, this.queue.shift() + os.EOL);
  }

  private tryRun() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runAsync().finally(() => this.isRunning = false);
  }
}

function fetchMessage(value: any, trace?: any) {
  return value instanceof Error
    ? value.stack ?? value.message
    : trace ?? value;
}

function showMessage(value: any, trace?: any) {
  const hours = String(new Date().getHours()).padStart(2, '0');
  const minutes = String(new Date().getMinutes()).padStart(2, '0');
  const seconds = String(new Date().getSeconds()).padStart(2, '0');
  console.info(`[${hours}:${minutes}:${seconds}] ${fetchMessage(value, trace)}`);
}
