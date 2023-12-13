import { DynamicModule } from '@nestjs/common';
import { buildGrpcOptions } from './utils';
import { apiRouterKey, getGrpcOptionsKey } from './constants';
import type { IApiServiceWithInfo } from '../ApiService';
import { IApiRouterCoreModuleOptions } from './interfaces';

export class ApiRouteCoreModule {
  public static forRoot({ imports, apiRouterFactory, servicesKeys }: IApiRouterCoreModuleOptions): DynamicModule {
    return {
      global: true,
      imports,
      module: ApiRouteCoreModule,
      providers: [
        {
          provide: apiRouterKey,
          useFactory: apiRouterFactory,
          inject: servicesKeys,
        },
        {
          provide: getGrpcOptionsKey,
          useFactory:
            (...services: IApiServiceWithInfo[]) =>
            (serviceName: string) => {
              const servicesInfo = services.filter(v => v?.serviceName === serviceName);

              if (!servicesInfo.length) {
                return null;
              }

              return buildGrpcOptions({
                host: servicesInfo.find(v => v.host)?.host,
                port: servicesInfo.find(v => v.port)?.port,
                packages: Array.from(new Set(servicesInfo.map(v => v.package))),
                protoPaths: servicesInfo.map(v => v.protoPath),
              });
            },
          inject: servicesKeys,
        },
      ],
      exports: [apiRouterKey, getGrpcOptionsKey],
    };
  }
}
