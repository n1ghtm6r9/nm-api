import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { firstLetterUpperCase } from '@nmxjs/utils';
import type { ICreateApiServiceOptions } from '../../ApiService';
import { GetPackageNameService } from './GetPackageNameService';
import { GenerateProtoMessagesService } from './GenerateProtoMessagesService';

@Injectable()
export class GenerateProtoService {
  constructor(
    protected readonly getPackageNameService: GetPackageNameService,
    protected readonly generateProtoMessagesService: GenerateProtoMessagesService,
  ) {}

  public call({ schema, service }: ICreateApiServiceOptions) {
    const packageName = this.getPackageNameService.call(service);
    const upperName = firstLetterUpperCase({ str: packageName });
    const protoPath = path.join(os.tmpdir(), `${upperName}.proto`);
    const protoServiceName = `${upperName}Service`;
    const protoFileData = [
      'syntax = "proto3";\n\n',
      `package ${packageName};\n\n`,
      'import "google/protobuf/struct.proto";\n\n',
      `service ${protoServiceName} {\n`,
    ];
    const protoMessages: string[] = [];

    for (const methodName of Object.keys(schema)) {
      const upperMethodName = firstLetterUpperCase({ str: methodName });
      const requestMethodName = `${upperMethodName}Request`;
      const responseMethodName = `${upperMethodName}Response`;
      protoFileData.push(`    rpc ${methodName} (${requestMethodName}) returns (${responseMethodName}) {}\n`);

      protoMessages.push(
        ...this.generateProtoMessagesService.call({
          messageName: requestMethodName,
          objSchema: schema[methodName].request,
        }),
      );

      protoMessages.push(
        ...this.generateProtoMessagesService.call({
          messageName: responseMethodName,
          objSchema: schema[methodName].response,
        }),
      );
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
