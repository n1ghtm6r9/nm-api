import { NotFoundError } from '@nmxjs/errors';
import { IConfig, configKey } from '@nmxjs/config';
import { Global, Module } from '@nestjs/common';
import { IApiServiceFactory } from './interfaces';
import { apiServiceFactoryKey } from './constants';
import * as Services from './services';
import { ITransportStrategy } from './interfaces';
import { transportStrategyKey } from './constants';
import { TcpTransportModule, tcpTransportStrategyKey } from '../TcpTransport';
import { NatsTransportModule, natsTransportStrategyKey } from '../NatsTransport';
import { GrpcTransportModule, grpcTransportStrategyKey } from '../GrpcTransport';

@Global()
@Module({
  imports: [TcpTransportModule, GrpcTransportModule, NatsTransportModule],
  providers: [
    ...Object.values(Services),
    {
      provide: apiServiceFactoryKey,
      useFactory: (createApiService: Services.CreateApiService): IApiServiceFactory => ({
        create: createApiService.call.bind(createApiService),
      }),
      inject: [Services.CreateApiService],
    },
    {
      provide: transportStrategyKey,
      useFactory: (config: IConfig, ...strategies: ITransportStrategy[]): ITransportStrategy => {
        const strategy = strategies.find(v => v.type === config.transport.type);

        if (!strategy) {
          throw new NotFoundError({
            entityName: 'TransportStrategy',
            search: [
              {
                field: 'type',
                value: config.transport.type,
              },
            ],
          });
        }

        return strategy;
      },
      inject: [configKey, tcpTransportStrategyKey, grpcTransportStrategyKey, natsTransportStrategyKey],
    },
  ],
  exports: [apiServiceFactoryKey],
})
export class ApiServiceModule {}
