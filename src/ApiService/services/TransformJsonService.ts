import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformJsonService {
  public call<T>(data: T): T {
    for (const key of Object.keys(data)) {
      if (typeof data[key] !== 'object') {
        continue;
      }

      const arr = Array.isArray(data[key]) ? data[key] : [data[key]];

      for (const item of arr) {
        if (typeof item !== 'object') {
          continue;
        }

        for (const secondKey of Object.keys(item)) {
          if (typeof item[secondKey] === 'string' && item[secondKey].substring(0, 4) === 'json') {
            item[secondKey] = JSON.parse(item[secondKey].substring(4));
          }
        }
      }
    }

    return data;
  }
}
