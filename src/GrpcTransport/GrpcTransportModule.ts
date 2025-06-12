import * as fs from 'fs';
import * as path from 'path';
import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { grpcTransportStrategyKey } from './constants';
import type { ITransportStrategy } from '../ApiService';
import { TransporterEnumType } from '@nmxjs/config';
import * as Services from './services';
import { configKey, IConfig } from '@nmxjs/config';
import { nestAppStartedKey } from '@nmxjs/constants';

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
export class GrpcTransportModule implements OnApplicationBootstrap {
  constructor(@Inject(configKey) protected readonly config: IConfig) {}

  public onApplicationBootstrap() {
    if (this.config.transport.type !== TransporterEnumType.GRPC) {
      return;
    }

    const intervalId = setInterval(() => {
      if (process.env[nestAppStartedKey] !== 'true') {
        return;
      }

      clearInterval(intervalId);
      const dirPath = path.join(process.cwd(), 'temp');

      if (!fs.existsSync(dirPath)) {
        return;
      }

      fs.rmdirSync(dirPath, { recursive: true });
    }, 10);
  }
}
