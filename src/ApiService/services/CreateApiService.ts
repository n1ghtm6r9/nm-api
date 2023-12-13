import { ClientGrpc, ClientProxyFactory } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { configKey, IConfig } from '@nmxjs/config';
import { buildGrpcOptions } from '../../ApiRouterCore/utils';
import { GenerateProtoService } from './GenerateProtoService';
import { ICreateApiServiceOptions, IApiServiceWithInfo } from '../interfaces';

@Injectable()
export class CreateApiService {
  constructor(@Inject(configKey) protected readonly config: IConfig, protected readonly generateProtoService: GenerateProtoService) {}

  public call({ schema, service, subService }: ICreateApiServiceOptions): IApiServiceWithInfo {
    const serviceInfo = this.config.grpc?.services.find(v => v.name === service);

    if (!serviceInfo) {
      return;
    }

    const serviceName = subService || service;
    const { protoPath, packageName, protoServiceName } = this.generateProtoService.call({ schema, service: serviceName });

    return {
      serviceName: service,
      subServiceName: subService,
      port: serviceInfo.port,
      host: serviceInfo.host,
      package: packageName,
      protoPath: protoPath,
      service: (
        ClientProxyFactory.create(
          buildGrpcOptions({
            port: serviceInfo.port,
            host: serviceInfo.host,
            packages: [packageName],
            protoPaths: [protoPath],
          }),
        ) as unknown as ClientGrpc
      ).getService(protoServiceName),
    };
  }
}
