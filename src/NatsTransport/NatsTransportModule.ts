import { Module, OnApplicationShutdown } from '@nestjs/common';
import { natsTransportStrategyKey } from './constants';
import type { ITransportStrategy } from '../ApiService';
import { TransporterEnumType } from '@nmxjs/config';
import * as Services from './services';

@Module({
  providers: [
    ...Object.values(Services),
    {
      provide: natsTransportStrategyKey,
      useFactory: (createApiService: Services.CreateApiService): ITransportStrategy => ({
        type: TransporterEnumType.NATS,
        createService: createApiService.call.bind(createApiService),
      }),
      inject: [Services.CreateApiService],
    },
  ],
  exports: [natsTransportStrategyKey],
})
export class NatsTransportModule {}
