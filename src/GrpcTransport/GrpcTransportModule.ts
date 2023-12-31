import { Module } from '@nestjs/common';
import { grpcTransportStrategyKey } from './constants';
import type { ITransportStrategy } from '../ApiService';
import { TransporterEnumType } from '@nmxjs/config';
import * as Services from './services';

@Module({
  providers: [
    ...Object.values(Services),
    {
      provide: grpcTransportStrategyKey,
      useFactory: (createApiService: Services.CreateApiService): ITransportStrategy => ({
        type: TransporterEnumType.GRPC,
        createService: createApiService.call.bind(createApiService),
      }),
      inject: [Services.CreateApiService],
    },
  ],
  exports: [grpcTransportStrategyKey],
})
export class GrpcTransportModule {}
