import { TransporterEnumType } from '@nmxjs/config';
import { ICreateApiServiceOptions } from './ICreateApiServiceOptions';
import { IApiServiceWithInfo } from './IApiServiceWithInfo';

export interface ITransportStrategy {
  type: TransporterEnumType;
  createService(options: ICreateApiServiceOptions): Promise<IApiServiceWithInfo>;
}
