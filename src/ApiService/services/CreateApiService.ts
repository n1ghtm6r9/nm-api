import * as NodeCache from 'node-cache';
import * as objHash from 'object-hash';
import { Inject, Injectable } from '@nestjs/common';
import { configKey, IConfig } from '@nmxjs/config';
import { isObservable, lastValueFrom } from 'rxjs';
import { transportStrategyKey, webApiProperty } from '../constants';
import { ICreateApiServiceOptions, IApiServiceWithInfo, ITransportStrategy, IApiServiceOptions } from '../interfaces';
import { TrySetupWebApiService } from './TrySetupWebApiService';
import { ServiceNotAvailableError } from '@nmxjs/errors';

@Injectable()
export class CreateApiService {
  protected cache = new NodeCache();

  constructor(
    @Inject(configKey) protected readonly config: IConfig,
    @Inject(transportStrategyKey) protected readonly transportStrategy: ITransportStrategy,
    protected readonly trySetupWebApiService: TrySetupWebApiService,
  ) {}

  public async call(options: ICreateApiServiceOptions): Promise<IApiServiceWithInfo> {
    this.trySetupWebApiService.call(options);
    const { service: currentService, ...result } = await this.transportStrategy.createService(options);
    const serviceName = options.subService || options.service;

    const service = Object.keys(currentService).reduce((res, methodName) => {
      res[methodName] = async (requestData: Record<string, unknown> = {}, methodOptions: IApiServiceOptions = {}) => {
        const route = `${serviceName}.${methodName}`;

        const getData = () => {
          const payload = currentService[methodName](requestData);
          return (isObservable(payload) ? lastValueFrom(payload) : payload).catch(e => {
            if (requestData.skipError || methodOptions.skipError) {
              return;
            }
            if (e.message.includes('Empty response. There are no subscribers listening to that message')) {
              throw new ServiceNotAvailableError(serviceName, methodName);
            }
            throw e;
          });
        };

        const cacheTtlMs = requestData.cacheTtlMs || methodOptions.cacheTtlMs;

        if (typeof cacheTtlMs !== 'number') {
          return getData();
        }

        const key = objHash({
          route,
          requestData,
        });

        let result = this.cache.get(key);

        if (!result) {
          result = await getData();
          this.cache.set(key, result, cacheTtlMs === Infinity ? undefined : Math.ceil(cacheTtlMs / 1000));
        }

        return result;
      };

      if (options.schema[methodName].webApiType) {
        Reflect.defineMetadata(webApiProperty, options.schema[methodName].webApiType, service[methodName]);
      }

      return res;
    }, {});

    return {
      ...result,
      service,
    };
  }
}
