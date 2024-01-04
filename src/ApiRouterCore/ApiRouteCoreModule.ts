import * as deepmerge from 'deepmerge';
import { DynamicModule } from '@nestjs/common';
import { ForbiddenError } from '@nmxjs/errors';
import { firstLetterUpperCase } from '@nmxjs/utils';
import { apiRouterKey, apiRouterResolversKey, getTransporterOptionsKey } from './constants';
import { WebApiTypeEnum, IApiServiceWithInfo, getQueryMutationByName, webApiProperty } from '../ApiService';
import { GetTransporterOptions, IApiRouterCoreModuleOptions } from './interfaces';

export class ApiRouteCoreModule {
  public static forRoot({ setupWebApi, imports, apiRouterFactory, servicesKeys, webApiAuthHandler }: IApiRouterCoreModuleOptions): DynamicModule {
    return {
      global: true,
      imports,
      module: ApiRouteCoreModule,
      providers: [
        {
          provide: apiRouterKey,
          useFactory: (...items: IApiServiceWithInfo[]) => apiRouterFactory(...items.map(v => v.service)),
          inject: servicesKeys,
        },
        {
          provide: getTransporterOptionsKey,
          useFactory:
            (...services: IApiServiceWithInfo[]): GetTransporterOptions =>
            (serviceName: string) => {
              const servicesInfo = services.filter(v => v?.serviceName === serviceName);

              if (!servicesInfo.length) {
                return null;
              }

              return servicesInfo.reduce((res, v) => deepmerge(res, v.options as object));
            },
          inject: servicesKeys,
        },
        {
          provide: apiRouterResolversKey,
          useFactory: apiRouter => {
            if (!setupWebApi) {
              return null;
            }
            return Object.keys(apiRouter).reduce((res: any, apiRouterKey) => {
              Object.keys(apiRouter[apiRouterKey]).forEach(key => {
                const item = apiRouter[apiRouterKey];
                const webApiType: WebApiTypeEnum = Reflect.getMetadata(webApiProperty, item[key]);

                if (!webApiType) {
                  return;
                }

                if (webApiType === WebApiTypeEnum.SECURED && !webApiAuthHandler) {
                  throw new Error('Web api auth handler is not setup!');
                }

                const fn =
                  webApiType === WebApiTypeEnum.FREE
                    ? (_, data) => item[key](data?.request || {})
                    : async (_, data, context) => {
                        const authResult = await webApiAuthHandler({
                          apiRouter,
                          req: context.req,
                        });

                        if (!authResult) {
                          throw new ForbiddenError();
                        }

                        return item[key](data?.request || {});
                      };
                const property = getQueryMutationByName(key).type;
                res[property] = {
                  ...res[property],
                  [`${apiRouterKey}0${firstLetterUpperCase({ str: key })}`]: fn,
                };
              });
              return res;
            }, {});
          },
          inject: [apiRouterKey],
        },
      ],
      exports: [apiRouterKey, getTransporterOptionsKey, apiRouterResolversKey],
    };
  }
}
