import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  collectDefaultMetrics,
  register,
} from 'prom-client';

type HttpLabels = { method: string; route: string; status: string };

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpDurationSeconds: Histogram<string>;

  constructor() {
    register.clear();
    collectDefaultMetrics();

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total de requisições HTTP por método, rota e status',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Latência das requisições HTTP em segundos',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
    });
  }

  recordRequest(labels: HttpLabels): void {
    this.httpRequestsTotal.inc(labels);
  }

  recordDuration(labels: HttpLabels, durationSec: number): void {
    this.httpDurationSeconds.observe(labels, durationSec);
  }

  metrics(): Promise<string> {
    return register.metrics();
  }
}
