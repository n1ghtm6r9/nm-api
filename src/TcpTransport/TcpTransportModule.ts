import { Module } from '@nestjs/common';
import { tcpTransportStrategyKey } from './constants';
import type { ITransportStrategy } from '../ApiService';
import { TransporterEnumType } from '@nmxjs/config';
import * as Services from './services';

@Module({
  providers: [
    ...Object.values(Services),
    {
      provide: tcpTransportStrategyKey,
      useFactory: (createApiService: Services.CreateApiService): ITransportStrategy => ({
        type: TransporterEnumType.TCP,
        createService: createApiService.call.bind(createApiService),
      }),
      inject: [Services.CreateApiService],
    },
  ],
  exports: [tcpTransportStrategyKey],
})
export class TcpTransportModule {}
