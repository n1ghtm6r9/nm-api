import { ICreateApiServiceOptions } from './ICreateApiServiceOptions';
import { IApiServiceWithInfo } from './IApiServiceWithInfo';
import { IApiService } from './IApiService';

export interface IApiServiceFactory<T extends IApiService<any> = IApiService<any>> {
  create(options: ICreateApiServiceOptions): IApiServiceWithInfo<T>;
}
