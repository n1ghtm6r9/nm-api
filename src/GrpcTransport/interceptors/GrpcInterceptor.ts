import { map, Observable } from 'rxjs';
import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { transformStringifyJson } from '../../ApiService/utils/transformStringifyJson';

@Injectable()
export class GrpcInterceptor implements NestInterceptor {
  constructor(protected readonly key: string) {}

  public intercept(_, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(res => transformStringifyJson(this.key, res)));
  }
}
