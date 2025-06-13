import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { firstLetterUpperCase } from '@nmxjs/utils';
import type { ICreateApiServiceOptions } from '../../ApiService';
import { GetPackageNameService } from './GetPackageNameService';
import { GenerateProtoMessagesService } from './GenerateProtoMessagesService';
import { setJsonFieldsKey } from '../../ApiService/utils/getJsonFieldsKeys';

@Injectable()
export class GenerateProtoService {
  constructor(
    protected readonly getPackageNameService: GetPackageNameService,
    protected readonly generateProtoMessagesService: GenerateProtoMessagesService,
  ) {}

  public call({ schema, service }: ICreateApiServiceOptions) {
    const packageName = this.getPackageNameService.call(service);
    const upperName = firstLetterUpperCase(packageName);
    const tempDir = path.join(process.cwd(), 'temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const protoPath = path.join(tempDir, `${upperName}.proto`);
    const protoServiceName = `${upperName}Service`;
    const protoFileData = [
      'syntax = "proto3";\n\n',
      `package ${packageName};\n\n`,
      'import "google/protobuf/struct.proto";\n\n',
      `service ${protoServiceName} {\n`,
    ];
    const protoMessages: string[] = [];
    const existMessageNames: string[] = [];

    for (const methodName of Object.keys(schema)) {
      const upperMethodName = firstLetterUpperCase(methodName);
      const requestMethodName = `${upperMethodName}Request`;
      const responseMethodName = `${upperMethodName}Response`;
      protoFileData.push(`    rpc ${methodName} (${requestMethodName}) returns (${responseMethodName}) {}\n`);

      if (schema[methodName].request) {
        setJsonFieldsKey(`${service}.${methodName}.request`, schema[methodName].request);
      }

      setJsonFieldsKey(`${service}.${methodName}.response`, schema[methodName].response);

      let res = this.generateProtoMessagesService.call({
        messageName: requestMethodName,
        objSchema: schema[methodName].request,
        existMessageNames,
      });

      protoMessages.push(...res.data);
      existMessageNames.push(...res.messageNames);

      res = this.generateProtoMessagesService.call({
        messageName: responseMethodName,
        objSchema: schema[methodName].response,
        existMessageNames,
      });

      protoMessages.push(...res.data);
      existMessageNames.push(...res.messageNames);
    }

    protoFileData.push('}\n\n');

    fs.writeFileSync(protoPath, [...protoFileData, ...protoMessages.join('')].join(''));

    return {
      protoPath,
      packageName,
      protoServiceName,
    };
  }
}
