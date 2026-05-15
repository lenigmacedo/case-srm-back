import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const method = req.method;
    const start = process.hrtime.bigint();

    const { metrics } = this;
    return next.handle().pipe(
      tap(() => {
        const res = ctx.switchToHttp().getResponse<Response>();
        const routeObj = req.route as { path?: string } | undefined;
        const route: string = routeObj?.path ?? req.url;
        const status = String(res.statusCode);
        const durationSec =
          Number(process.hrtime.bigint() - start) / 1_000_000_000;

        metrics.recordRequest({ method, route, status });
        metrics.recordDuration({ method, route, status }, durationSec);
      }),
    );
  }
}
