import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class AppLogger {
  private readonly winston: winston.Logger;

  constructor(private readonly ctx: RequestContextService) {
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private meta(extra?: object): object {
    const traceId = this.ctx.getTraceId();
    return { ...(traceId ? { traceId } : {}), ...extra };
  }

  log(message: string, meta?: object): void {
    this.winston.info(message, this.meta(meta));
  }

  error(message: string, meta?: object): void {
    this.winston.error(message, this.meta(meta));
  }

  warn(message: string, meta?: object): void {
    this.winston.warn(message, this.meta(meta));
  }
}
