import { Injectable } from '@nestjs/common';

@Injectable()
export class GetPackageNameService {
  public call = (serviceName: string) =>
    serviceName
      .split('-')
      .map((v, i) => (i === 0 ? v : `${v[0].toUpperCase()}${v.slice(1)}`))
      .join('');
}
