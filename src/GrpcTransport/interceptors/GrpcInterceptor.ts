import { map, Observable } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { transformParseJson } from '../../ApiService/utils/transformParseJson';
import { transformStringifyJson } from '../../ApiService/utils/transformStringifyJson';

@Injectable()
export class GrpcInterceptor implements NestInterceptor {
  constructor(protected readonly key: string) {}

  public intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    transformParseJson(`${this.key}.request`, ctx.switchToRpc().getData());
    return next.handle().pipe(map(res => transformStringifyJson(`${this.key}.response`, res)));
  }
}
