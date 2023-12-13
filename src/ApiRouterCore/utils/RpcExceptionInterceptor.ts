import { catchError, tap } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { uuid, readableJson } from '@nmxjs/utils';
import { Injectable, NestInterceptor, CallHandler, Logger, ExecutionContext } from '@nestjs/common';
import { endErrorText } from '../constants';

@Injectable()
export class RpcExceptionInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler) {
    const requestId = uuid();
    const path = context.getArgByIndex(2)?.call?.handler?.path;
    Logger.debug(
      `Rpc Request: ${readableJson({
        requestId,
        data: context.getArgByIndex(0),
        ...(path ? { path } : { event: context.getArgByIndex(1).args[0] }),
      })}`,
    );
    return next.handle().pipe(
      tap(data => {
        Logger.debug(
          `Rpc Response: ${readableJson({
            requestId,
            data,
          })}`,
        );
      }),
      catchError(e => {
        const splitResult: string[] = e.message.split(endErrorText);
        const errorMessage = splitResult.length === 1 ? e.stack : splitResult[0];
        Logger.debug(
          `Rpc Response: ${readableJson({
            requestId,
            error: {
              message: errorMessage,
            },
          })}`,
        );
        Logger.error(errorMessage);
        throw new RpcException(`${errorMessage}${endErrorText}`);
      }),
    );
  }
}
