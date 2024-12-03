import { map, Observable } from 'rxjs';
import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class GrpcInterceptor implements NestInterceptor {
  intercept(_, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(res => {
        for (const key of Object.keys(res)) {
          if (typeof res[key] !== 'object') {
            continue;
          }

          const arr = Array.isArray(res[key]) ? res[key] : [res[key]];

          for (const item of arr) {
            if (typeof item !== 'object') {
              continue;
            }

            for (const secondKey of Object.keys(item)) {
              if (typeof item[secondKey] === 'object') {
                item[secondKey] = `json${JSON.stringify(item[secondKey])}`;
              }
            }
          }
        }

        return res;
      }),
    );
  }
}
