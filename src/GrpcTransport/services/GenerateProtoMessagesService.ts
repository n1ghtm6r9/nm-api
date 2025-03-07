import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { IGenerateProtoMessagesOptions } from '../interfaces';

@Injectable()
export class GenerateProtoMessagesService {
  public call({ messageName, objSchema, existMessageNames }: IGenerateProtoMessagesOptions) {
    let messageNames = [messageName];

    if (existMessageNames.find(v => v === messageName)) {
      return {
        data: [],
        messageNames: [],
      };
    }

    if (!objSchema) {
      return {
        data: [`message ${messageName} {}\n\n`],
        messageNames,
      };
    }

    const fieldsResult: string[] = [`message ${messageName} {\n`];
    const nestedResult: string[] = [];

    const metaDataFields: string[] = Reflect.getMetadataKeys(objSchema).filter(v => v.includes('field:'));

    metaDataFields.forEach((metaDataField, i) => {
      const [, fieldName] = metaDataField.split(':');
      const fieldData = Reflect.getMetadata(metaDataField, objSchema);
      let fieldStr = '    ';

      if (fieldData.array) {
        fieldStr += `repeated `;
      }

      if (fieldData.type === String || fieldData.enum || fieldData.type === Object || fieldData.type === JSON) {
        fieldStr += `string `;
      } else if (fieldData.type === Number) {
        fieldStr += `double `;
      } else if (fieldData.type === Boolean) {
        fieldStr += `bool `;
      } else {
        fieldStr += `${fieldData.type.name} `;

        const res = this.call({
          messageName: fieldData.type.name,
          objSchema: fieldData.type,
          existMessageNames: [...messageNames, ...existMessageNames],
        });

        nestedResult.push(...res.data);
        messageNames = Array.from(new Set([...messageNames, ...res.messageNames]));
      }

      fieldStr += `${fieldName} = ${i + 1};\n`;

      fieldsResult.push(fieldStr);
    });

    fieldsResult.push('}\n\n');

    return {
      data: [...fieldsResult.join(''), ...nestedResult],
      messageNames,
    };
  }
}
