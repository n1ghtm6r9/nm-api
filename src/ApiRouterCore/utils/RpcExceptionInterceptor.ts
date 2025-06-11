import { catchError, tap } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { uuid, readableJson } from '@nmxjs/utils';
import { Injectable, NestInterceptor, CallHandler, Logger, ExecutionContext } from '@nestjs/common';
import { endErrorText } from '../constants';
import type { INotifier } from '@nmxjs/notifications';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  constructor(protected readonly debug: boolean = false, protected readonly notifier?: INotifier) {}

  public intercept(context: ExecutionContext, next: CallHandler) {
    const requestId = uuid();
    const path = context.getArgByIndex(2)?.call?.handler?.path;

    if (this.debug) {
      Logger.debug(
        `Rpc Request: ${readableJson({
          requestId,
          data: context.getArgByIndex(0),
          ...(path ? { path } : { event: context.getArgByIndex(1).args[0] }),
        })}`,
      );
    }
    return next.handle().pipe(
      tap(data => {
        if (this.debug) {
          Logger.debug(
            `Rpc Response: ${readableJson({
              requestId,
              data,
            })}`,
          );
        }
      }),
      catchError(e => {
        const splitResult: string[] = e.message.split(endErrorText);
        const errorMessage = splitResult.length === 1 ? e.stack : splitResult[0];
        if (this.debug) {
          Logger.debug(
            `Rpc Response: ${readableJson({
              requestId,
              error: {
                message: errorMessage,
              },
            })}`,
          );
        }
        Logger.error(errorMessage);
        if (this.notifier && !e.silent) {
          this.notifier.sendError({ message: errorMessage });
        }
        throw new RpcException(`${errorMessage}${endErrorText}`);
      }),
    );
  }
}
