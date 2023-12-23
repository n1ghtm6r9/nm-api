import { MicroserviceOptions } from '@nestjs/microservices';
import { IApiService } from './IApiService';

export interface IApiServiceWithInfo<T extends IApiService<any> = IApiService<any>> {
  service: T;
  serviceName: string;
  options: MicroserviceOptions;
}
