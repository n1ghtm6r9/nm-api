import { ClientProxyFactory, Transport, NatsOptions } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { configKey, IConfig } from '@nmxjs/config';
import type { ICreateApiServiceOptions, IApiServiceWithInfo } from '../../ApiService';

@Injectable()
export class CreateApiService {
  constructor(@Inject(configKey) protected readonly config: IConfig) {}

  public async call(options: ICreateApiServiceOptions): Promise<IApiServiceWithInfo> {
    const natsOptions: NatsOptions = {
      transport: Transport.NATS,
      options: {
        servers: this.config.transport.services.map(v => `nats://${v.host || '127.0.0.1'}:${v.port || 4222}`),
        ...(this.config.transport.keepaliveTimeMs ? { pingInterval: this.config.transport.keepaliveTimeMs } : {}),
      },
    };

    const natsClient = ClientProxyFactory.create(natsOptions);
    await natsClient.connect();

    const service = Object.keys(options.schema).reduce((res, methodName) => {
      res[methodName] = data => natsClient.send(`${options.subService || options.service}.${methodName}`, data);
      return res;
    }, {});

    process.once('SIGTERM', () => {
      natsClient.close();
    });

    process.once('SIGINT', () => {
      natsClient.close();
    });

    return {
      serviceName: options.service,
      options: natsOptions,
      service,
    };
  }
}
