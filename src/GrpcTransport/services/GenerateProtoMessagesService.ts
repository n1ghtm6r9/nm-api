import { Injectable } from '@nestjs/common';
import { IGenerateProtoMessagesOptions } from '../interfaces';

@Injectable()
export class GenerateProtoMessagesService {
  public call({ messageName, objSchema }: IGenerateProtoMessagesOptions): string[] {
    if (!objSchema) {
      return [`message ${messageName} {}\n\n`];
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

      if (fieldData.type === String || fieldData.enum) {
        fieldStr += `string `;
      } else if (fieldData.type === Number) {
        fieldStr += `double `;
      } else if (fieldData.type === Boolean) {
        fieldStr += `bool `;
      } else if (fieldData.type === Object) {
        fieldStr += `google.protobuf.Struct `;
      } else {
        fieldStr += `${fieldData.type.name} `;
        nestedResult.push(
          ...this.call({
            messageName: fieldData.type.name,
            objSchema: fieldData.type,
          }),
        );
      }

      fieldStr += `${fieldName} = ${i + 1};\n`;

      fieldsResult.push(fieldStr);
    });

    fieldsResult.push('}\n\n');

    return [...fieldsResult.join(''), ...nestedResult];
  }
}
