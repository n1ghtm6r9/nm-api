import { ClientGrpc, ClientProxyFactory, Transport, GrpcOptions } from '@nestjs/microservices';
import { defaultHost } from '@nmxjs/constants';
import { Inject, Injectable } from '@nestjs/common';
import { configKey, IConfig } from '@nmxjs/config';
import { GenerateProtoService } from './GenerateProtoService';
import type { ICreateApiServiceOptions, IApiServiceWithInfo } from '../../ApiService';

@Injectable()
export class CreateApiService {
  constructor(@Inject(configKey) protected readonly config: IConfig, protected readonly generateProtoService: GenerateProtoService) {}

  public async call({ schema, service, subService }: ICreateApiServiceOptions): Promise<IApiServiceWithInfo> {
    const serviceInfo = this.config.transport.services.find(v => v.name === service);

    if (!serviceInfo) {
      return;
    }

    const serviceName = subService || service;
    const { protoPath, packageName, protoServiceName } = this.generateProtoService.call({ schema, service: serviceName });

    const grpcOptions: GrpcOptions = {
      transport: Transport.GRPC,
      options: {
        url: `${serviceInfo.host || defaultHost}:${serviceInfo.port || 3000}`,
        package: [packageName],
        protoPath: [protoPath],
        keepalive: {
          keepaliveTimeMs: this.config.transport.keepaliveTimeMs || 40000,
          keepaliveTimeoutMs: this.config.transport.keepaliveTimeoutMs || 20000,
          keepalivePermitWithoutCalls: 1,
        },
        channelOptions: {
          'grpc.use_local_subchannel_pool': 0,
          'grpc.default_compression_algorithm': 2,
          'grpc.default_compression_level': 3,
        },
        loader: {
          arrays: true,
          objects: true,
        },
      },
    };

    return {
      serviceName: service,
      options: grpcOptions,
      service: (ClientProxyFactory.create(grpcOptions) as unknown as ClientGrpc).getService(protoServiceName),
    };
  }
}
