import { isWorkerApp } from '@nmxjs/utils';
import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { getConfig, TransporterEnumType } from '@nmxjs/config';

const config = getConfig();

export const ControllerEndpoints = (serviceName: string) => (target: Function) => {
  Controller()(target);
  if (!isWorkerApp()) {
    Object.getOwnPropertyNames(target.prototype).forEach(key => {
      if (key === 'constructor') {
        return;
      }
      if (config.transport.type === TransporterEnumType.GRPC) {
        GrpcMethod(
          `${serviceName
            .split('-')
            .map(v => `${v[0].toUpperCase()}${v.slice(1)}`)
            .join('')}Service`,
          key,
        )(target, key, Object.getOwnPropertyDescriptor(target.prototype, key));
      } else {
        MessagePattern(`${serviceName}.${key}`)(target, key, Object.getOwnPropertyDescriptor(target.prototype, key));
      }
    });
  }
};
