import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const traceId = (request.headers['x-request-id'] as string) ?? randomUUID();

    const { statusCode, error, message } = this.resolve(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `[${traceId}] ${request.method} ${request.url} → ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      traceId,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): {
    statusCode: number;
    error: string;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();

      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as Record<string, unknown>).message
          : exception.message;

      return {
        statusCode,
        error: HttpStatus[statusCode] ?? 'HTTP_EXCEPTION',
        message: message as string | string[],
      };
    }

    if (exception instanceof QueryFailedError) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'DATABASE_ERROR',
        message: 'A database operation failed. Check your input and try again.',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    };
  }
}
