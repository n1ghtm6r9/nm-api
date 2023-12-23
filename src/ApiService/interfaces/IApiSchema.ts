import { WebApiTypeEnum } from './WebApiTypeEnum';

export type IApiSchema = Record<
  string,
  {
    request?: object;
    response: object;
    webApiType?: WebApiTypeEnum;
  }
>;
