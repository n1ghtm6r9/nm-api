import { WebApiTypeEnum } from './WebApiTypeEnum';

export interface IApiSchemaItem {
  request?: object;
  response: object;
  webApiType?: WebApiTypeEnum;
}
