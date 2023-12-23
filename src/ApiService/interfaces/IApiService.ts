import { IApiSchema } from './IApiSchema';
import { IApiServiceOptions } from './IApiServiceOptions';

export type IApiService<T extends IApiSchema> = {
  [key in keyof T]: T[key]['request'] extends object
    ? // @ts-ignore
      (request: T[key]['request']['prototype'], options?: IApiServiceOptions) => Promise<T[key]['response']['prototype']>
    : // @ts-ignore
      (options?: IApiServiceOptions) => Promise<T[key]['response']['prototype']>;
};
