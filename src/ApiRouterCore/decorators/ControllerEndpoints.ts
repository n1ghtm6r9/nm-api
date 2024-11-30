import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { isWorkerApp, firstLetterUpperCase } from '@nmxjs/utils';

export const ControllerEndpoints = (serviceName: string) => (target: Function) => {
  Controller()(target);
  if (!isWorkerApp()) {
    Object.getOwnPropertyNames(target.prototype).forEach(key => {
      if (key === 'constructor') {
        return;
      }
      GrpcMethod(`${firstLetterUpperCase({ str: serviceName })}Service`, key)(target, key, Object.getOwnPropertyDescriptor(target.prototype, key));
      MessagePattern(`${serviceName}.${key}`)(target, key, Object.getOwnPropertyDescriptor(target.prototype, key));
    });
  }
};
