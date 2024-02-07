import { ClientProxyFactory, Transport, TcpClientOptions } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { configKey, IConfig } from '@nmxjs/config';
import type { ICreateApiServiceOptions, IApiServiceWithInfo } from '../../ApiService';

@Injectable()
export class CreateApiService {
  constructor(@Inject(configKey) protected readonly config: IConfig) {}

  public async call(options: ICreateApiServiceOptions): Promise<IApiServiceWithInfo> {
    const serviceInfo = this.config.transport.services.find(v => v.name === service);

    if (!serviceInfo) {
      return;
    }

    const tcpOptions: TcpClientOptions = {
      transport: Transport.TCP,
      options: {
        host: serviceInfo.host || '127.0.0.1',
        port: serviceInfo.port || 3000,
      },
    };

    const client = ClientProxyFactory.create(tcpOptions);

    const service = Object.keys(options.schema).reduce((res, methodName) => {
      res[methodName] = data => client.send(`${options.subService || options.service}.${methodName}`, data);
      return res;
    }, {});

    return {
      service,
      options: tcpOptions,
      serviceName: options.service,
    };
  }
}
