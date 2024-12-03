import { isWorkerApp } from '@nmxjs/utils';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { getConfig, TransporterEnumType } from '@nmxjs/config';
import { GrpcInterceptor } from '../../GrpcTransport/interceptors';

const config = getConfig();

export const ControllerEndpoints = (serviceName: string) => (target: Function) => {
  Controller()(target);
  if (!isWorkerApp()) {
    Object.getOwnPropertyNames(target.prototype).forEach(key => {
      if (key === 'constructor') {
        return;
      }
      const methodKey = `${serviceName}.${key}`;
      if (config.transport.type === TransporterEnumType.GRPC) {
        GrpcMethod(
          `${serviceName
            .split('-')
            .map(v => `${v[0].toUpperCase()}${v.slice(1)}`)
            .join('')}Service`,
          key,
        )(target, key, Object.getOwnPropertyDescriptor(target.prototype, key));
        UseInterceptors(new GrpcInterceptor(methodKey))(target, key, Object.getOwnPropertyDescriptor(target.prototype, key));
      } else {
        MessagePattern(methodKey)(target, key, Object.getOwnPropertyDescriptor(target.prototype, key));
      }
    });
  }
};
