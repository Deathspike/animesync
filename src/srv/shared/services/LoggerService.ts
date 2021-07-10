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
    this.enqueue('DEBUG', extract(value));
  }
  
  error(value: Error | string, trace?: string) {
    console.error(extract(value, trace));
    this.enqueue('ERROR', extract(value, trace));
  }

  info(value: string) {
    console.log(extract(value));
    this.enqueue('INFO', extract(value));
  }

  log(value: string) {
    console.log(extract(value));
    this.enqueue('LOG', extract(value));
  }
  
  verbose(value: string) {
    this.enqueue('DEBUG', extract(value));
  }

  warn(value: string) {
    console.error(extract(value));
    this.enqueue('WARN', extract(value));
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

function extract(value: any, trace?: any) {
  return value instanceof Error
    ? value.stack ?? value.message
    : trace ?? value;
}
