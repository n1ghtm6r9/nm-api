import * as objHash from 'object-hash';
import { ClientProxyFactory, Transport, NatsOptions } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { configKey, IConfig } from '@nmxjs/config';
import type { ICreateApiServiceOptions, IApiServiceWithInfo } from '../../ApiService';

const clients = new Map<string, ClientNats>();

@Injectable()
export class CreateApiService {
  constructor(@Inject(configKey) protected readonly config: IConfig) {}

  public async call(options: ICreateApiServiceOptions): Promise<IApiServiceWithInfo> {
    const natsOptions: NatsOptions = {
      transport: Transport.NATS,
      options: {
        servers: this.config.transport.services.map(v => `nats://${v.host || '127.0.0.1'}:${v.port || 4222}`).sort(),
        ...(this.config.transport.keepaliveTimeMs ? { pingInterval: this.config.transport.keepaliveTimeMs } : {}),
      },
    };

    const key = objHash(natsOptions);
    let client = clients.get(key);

    if (!client) {
      client = ClientProxyFactory.create(natsOptions) as ClientNats;
      await client.connect();
      clients.set(key, client);
    }

    const service = Object.keys(options.schema).reduce((res, methodName) => {
      res[methodName] = data => client.send(`${options.subService || options.service}.${methodName}`, data);
      return res;
    }, {});

    const onClose = () => {
      client.close();
      clients.delete(key);
    };

    process.once('SIGTERM', onClose);
    process.once('SIGINT', onClose);

    return {
      serviceName: options.service,
      options: natsOptions,
      service,
    };
  }
}
