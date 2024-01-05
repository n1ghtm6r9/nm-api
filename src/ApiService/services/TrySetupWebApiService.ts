import { Injectable } from '@nestjs/common';
import { getQueryMutationByName } from '../utils';
import { firstLetterUpperCase, toCamelCase } from '@nmxjs/utils';
import { ICreateApiServiceOptions } from '../interfaces';

const { Args } = require('@nestjs/graphql');

@Injectable()
export class TrySetupWebApiService {
  public call({ schema, service, subService }: ICreateApiServiceOptions) {
    const target = () => {};

    Object.keys(schema).forEach(methodName => {
      if (!schema[methodName].webApiType) {
        return;
      }

      getQueryMutationByName(methodName).decorator(() => schema[methodName].response, {
        name: `${toCamelCase({ str: subService || service })}0${firstLetterUpperCase({ str: methodName })}`,
      })(target, methodName, undefined);

      if (typeof schema[methodName].request === 'function') {
        Reflect.defineMetadata('design:paramtypes', [schema[methodName].request], target, methodName);
        Args('request', { type: () => schema[methodName].request })(target, methodName, 0);
      }
    }, {});
  }
}
