import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestContextService } from './context/request-context.service';
import { RequestContextMiddleware } from './context/request-context.middleware';
import { AppLogger } from './logger/app-logger.service';
import { HttpLoggingInterceptor } from './interceptors/http-logging.interceptor';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { MetricsService } from './metrics/metrics.service';
import { MetricsController } from './metrics/metrics.controller';
import { HealthController } from './health/health.controller';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Global()
@Module({
  providers: [
    RequestContextService,
    AppLogger,
    MetricsService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
  controllers: [HealthController, MetricsController],
  exports: [RequestContextService, AppLogger, MetricsService],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
