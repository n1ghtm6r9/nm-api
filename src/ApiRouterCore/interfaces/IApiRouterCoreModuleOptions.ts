import { ModuleMetadata } from '@nestjs/common';

export interface IApiRouterCoreModuleOptions extends Required<Pick<ModuleMetadata, 'imports'>> {
  servicesKeys: string[];
  apiRouterFactory(...any): object;
}
