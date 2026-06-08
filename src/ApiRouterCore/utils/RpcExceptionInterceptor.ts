import { catchError, tap } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { uuid, readableJson } from '@nmxjs/utils';
import { Injectable, NestInterceptor, CallHandler, Logger, ExecutionContext } from '@nestjs/common';
import { endErrorText } from '../constants';
import type { INotifier } from '@nmxjs/notifications';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  constructor(
    protected readonly serviceName: string,
    protected readonly debug: boolean = false,
    protected readonly notifier?: INotifier,
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler) {
    const requestId = uuid();
    const path = context.getArgByIndex(2)?.path || context.getArgByIndex(2)?.call?.handler?.path;

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
        const message = typeof e?.message === 'string' ? e.message : String(e);
        const splitResult: string[] = message.split(endErrorText);
        const isProcessed = splitResult.length > 1;
        const errorMessage = isProcessed ? splitResult[0] : message;

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
        Logger.error(isProcessed ? errorMessage : e?.stack || errorMessage);
        if (this.notifier && !e?.silent) {
          this.notifier.sendError({
            message: errorMessage.split('\n    at')[0],
            serviceName: this.serviceName,
            path,
            code: e?.code || 'UNKNOWN RPC',
            params: context.getArgByIndex(0)?.res === context.getArgByIndex(1) ? undefined : context.getArgByIndex(0),
          });
        }

        const errorPayload = JSON.stringify({
          message: errorMessage.split('\n    at')[0],
          code: e?.code,
          statusCode: e?.statusCode,
        });

        throw new RpcException(`${errorPayload}${endErrorText}`);
      }),
    );
  }
}
