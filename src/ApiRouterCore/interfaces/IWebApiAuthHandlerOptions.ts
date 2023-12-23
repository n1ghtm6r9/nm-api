import type { Request } from 'express';

export interface IWebApiAuthHandlerOptions<T = any> {
  req: Request;
  apiRouter: T;
}
