import { IApiService } from './IApiService';

export interface IApiServiceWithInfo<T extends IApiService<any> = IApiService<any>> {
  port: number;
  host?: string;
  protoPath: string;
  package: string;
  serviceName: string;
  subServiceName?: string;
  service: T;
}
