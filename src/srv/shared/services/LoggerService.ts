import * as app from '..';
import * as ncm from '@nestjs/common';
import fs from 'fs-extra';
import lockfile from 'proper-lockfile';
import os from 'os';
import path from 'path';

export class LoggerService implements ncm.LoggerService {
  private readonly id: string;
  private readonly queue: Array<string>;
  private isRunning: boolean;

  constructor() {
    this.id = String(process.pid).padStart(5);
    this.isRunning = false;
    this.queue = [];
  }

  debug(value: string) {
    this.enqueue('DEBUG', fetchMessage(value));
  }
  
  error(value: Error | string, trace?: string) {
    showMessage(value, trace);
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
    showMessage(value);
    this.enqueue('WARN', fetchMessage(value));
  }

  private enqueue(level: string, line: string) {
    this.queue.push(`[${new Date().toISOString()}] ${this.id} ${level.padEnd(5)} ${line}`);
    this.tryRun();
  }

  private async runAsync() {
    await fs.ensureDir(app.settings.path.logger);
    const filePath = path.join(app.settings.path.logger, `${new Date().toISOString().substr(0, 10)}.log`);
    const release = await lockfile.lock(filePath, {realpath: false, retries: {forever: true}});
    while (this.queue.length) await fs.appendFile(filePath, this.queue.shift() + os.EOL);
    await release();
  }

  private tryRun() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runAsync().finally(() => {
      this.isRunning = false;
      if (this.queue.length) this.tryRun();
    });
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
