import * as app from '..';
import * as ncm from '@nestjs/common';
import os from 'os';
import path from 'path';
type LoggerLine = {value: string, zoneId?: string};

@ncm.Injectable()
export class LoggerService implements ncm.LoggerService {
  private readonly fileService: app.FileService;
  private readonly queue: Array<LoggerLine>;
  private isRunning: boolean;

  constructor(fileService: app.FileService) {
    this.isRunning = false;
    this.fileService = fileService;
    this.queue = [];
  }

  debug(value: string, zoneId?: string) {
    this.enqueue('DEBUG', fetchMessage(value), zoneId);
  }
  
  error(value: Error | string, trace?: string, zoneId?: string) {
    this.enqueue('ERROR', fetchMessage(value, trace), zoneId);
  }

  info(value: string, zoneId?: string) {
    showMessage(value);
    this.enqueue('INFO', fetchMessage(value), zoneId);
  }

  log(value: string, zoneId?: string) {
    showMessage(value);
    this.enqueue('LOG', fetchMessage(value), zoneId);
  }
  
  verbose(value: string, zoneId?: string) {
    this.enqueue('DEBUG', fetchMessage(value), zoneId);
  }

  warn(value: string, zoneId?: string) {
    this.enqueue('WARN', fetchMessage(value), zoneId);
  }

  private enqueue(level: string, line?: string, zoneId?: string) {
    const value = `[${new Date().toISOString()}] ${level.padEnd(5)} ${line?.trim()}`;
    this.queue.push({value, zoneId});
    this.tryRun();
  }

  private async runAsync() {
    while (this.queue.length) {
      const line = this.queue.shift();
      if (line) {
        const fileDate = new Date().toISOString().substr(0, 10);
        const fileName = line.zoneId ? `${fileDate}.${line.zoneId}.log` : `${fileDate}.log`;
        await this.fileService.appendAsync(path.join(app.settings.path.logger, fileName), line.value + os.EOL);
      } else {
        break;
      }
    }
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
