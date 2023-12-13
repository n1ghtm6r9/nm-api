import { IApiSchema } from './IApiSchema';

export interface ICreateApiServiceOptions {
  service: string;
  schema: IApiSchema;
  subService?: string;
}
