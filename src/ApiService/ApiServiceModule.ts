import { Global, Module } from '@nestjs/common';
import { IApiServiceFactory } from './interfaces';
import { apiServiceFactoryKey } from './constants';
import * as Services from './services';

@Global()
@Module({
  providers: [
    ...Object.values(Services),
    {
      provide: apiServiceFactoryKey,
      useFactory: (createApiService: Services.CreateApiService): IApiServiceFactory => ({
        create: createApiService.call.bind(createApiService),
      }),
      inject: [Services.CreateApiService],
    },
  ],
  exports: [apiServiceFactoryKey],
})
export class ApiServiceModule {}
