import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  traceId: string;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, fn: () => void): void {
    this.storage.run(context, fn);
  }

  getTraceId(): string | undefined {
    return this.storage.getStore()?.traceId;
  }
}
