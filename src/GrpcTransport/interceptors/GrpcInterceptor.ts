import { map, Observable } from 'rxjs';
import { CallHandler, Injectable, NestInterceptor } from '@nestjs/common';
import { getJsonFieldsKeys } from '../../ApiService/utils/getJsonFieldsKeys';

@Injectable()
export class GrpcInterceptor implements NestInterceptor {
  constructor(protected readonly key: string) {}

  public intercept(_, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(res => {
        const jsonFieldsKeys = getJsonFieldsKeys(this.key);

        if (!jsonFieldsKeys || jsonFieldsKeys.length === 0) {
          return res;
        }

        for (const path of jsonFieldsKeys) {
          const [firstKey, secondKey] = path.split('.');

          if (firstKey && !secondKey) {
            res[firstKey] = `json${JSON.stringify(res[firstKey])}`;
          } else if (Array.isArray(res[firstKey])) {
            res[firstKey].forEach(item => {
              item[secondKey] = `json${JSON.stringify(item[secondKey])}`;
            });
          } else {
            res[firstKey][secondKey] = `json${JSON.stringify(res[firstKey][secondKey])}`;
          }
        }

        return res;
      }),
    );
  }
}
