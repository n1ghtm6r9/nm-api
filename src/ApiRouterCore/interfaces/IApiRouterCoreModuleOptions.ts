import { ModuleMetadata } from '@nestjs/common';
import { IWebApiAuthHandlerOptions } from './IWebApiAuthHandlerOptions';

export interface IApiRouterCoreModuleOptions extends Required<Pick<ModuleMetadata, 'imports'>> {
  servicesKeys: Array<string | symbol>;
  apiRouterFactory(...any): object;
  webApiAuthHandler?(options: IWebApiAuthHandlerOptions): Promise<boolean>;
}
