import * as objHash from 'object-hash';
import { ClientProxyFactory, Transport, NatsOptions } from '@nestjs/microservices';
import { defaultHost } from '@nmxjs/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { configKey, IConfig } from '@nmxjs/config';
import type { ICreateApiServiceOptions, IApiServiceWithInfo } from '../../ApiService';

@Injectable()
export class CreateApiService {
  protected readonly clients = new Map<string, ClientNats>();

  constructor(@Inject(configKey) protected readonly config: IConfig) {}

  public async call(options: ICreateApiServiceOptions): Promise<IApiServiceWithInfo> {
    const natsOptions: NatsOptions = {
      transport: Transport.NATS,
      options: {
        servers: this.config.transport.services.map(v => `nats://${v.host || defaultHost}:${v.port || 4222}`).sort(),
        ...(this.config.transport.keepaliveTimeMs ? { pingInterval: this.config.transport.keepaliveTimeMs } : {}),
      },
    };

    const key = objHash(natsOptions);
    let client = this.clients.get(key);

    if (!client) {
      client = ClientProxyFactory.create(natsOptions) as ClientNats;
      this.clients.set(key, client);
      await client.connect();
      const onClose = () => {
        client.close();
        this.clients.delete(key);
      };

      process.once('SIGTERM', onClose);
      process.once('SIGINT', onClose);
    }

    const service = Object.keys(options.schema).reduce((res, methodName) => {
      res[methodName] = data => client.send(`${options.subService || options.service}.${methodName}`, data);
      return res;
    }, {});

    return {
      service,
      options: natsOptions,
      serviceName: options.service,
    };
  }
}
