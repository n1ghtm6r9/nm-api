import { ModuleMetadata } from '@nestjs/common';

export interface IApiRouterCoreModuleOptions extends Required<Pick<ModuleMetadata, 'imports'>> {
  servicesKeys: Array<string | symbol>;
  apiRouterFactory(...any): object;
}
