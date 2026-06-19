import { map, Observable } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { deepParseJson } from '../../ApiService/utils/deepParseJson';
import { deepStringifyJson } from '../../ApiService/utils/deepStringifyJson';
import { transformParseJson } from '../../ApiService/utils/transformParseJson';
import { transformStringifyJson } from '../../ApiService/utils/transformStringifyJson';

@Injectable()
export class GrpcInterceptor implements NestInterceptor {
  constructor(protected readonly key: string) {}

  public intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const requestData = ctx.switchToRpc().getData();
    deepParseJson(requestData);
    transformParseJson(`${this.key}.request`, requestData);
    return next.handle().pipe(
      map(res => {
        transformStringifyJson(`${this.key}.response`, res);
        deepStringifyJson(res);
        return res;
      }),
    );
  }
}
