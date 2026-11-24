import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const startTime = Date.now();

    const request = context.switchToHttp().getRequest();

    console.log(`Before: ${request.method} ${request.url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        console.log(
          `After: ${request.method} ${request.url} - ${duration}ms`,
        );
      }),
    );
  }
}