import { IApiSchema } from './IApiSchema';

export type IApiService<T extends IApiSchema> = {
  [key in keyof T]: T[key]['request'] extends object
    ? // @ts-ignore
      (request: T[key]['request']['prototype']) => Promise<T[key]['response']['prototype']>
    : // @ts-ignore
      () => Promise<T[key]['response']['prototype']>;
};
