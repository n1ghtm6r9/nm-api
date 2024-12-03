const jsonFieldsKeysMap: Map<string, string[]> = new Map();

export const getJsonFieldsKeys = (key: string) => jsonFieldsKeysMap.get(key);

export function setJsonFieldsKey(key: string, objSchema: object, prevKey?: string) {
  if (!jsonFieldsKeysMap.get(key)) {
    jsonFieldsKeysMap.set(key, []);
  }

  if (prevKey && prevKey.split('.').length >= 2) {
    return;
  }

  const metaDataFields: string[] = Reflect.getMetadataKeys(objSchema).filter(v => v.includes('field:'));

  for (const metaDataField of metaDataFields) {
    const [, fieldName] = metaDataField.split(':');
    const fieldData = Reflect.getMetadata(metaDataField, objSchema);

    if (fieldData.type === Object || fieldData.type === JSON) {
      jsonFieldsKeysMap.get(key).push(prevKey ? `${prevKey}.${fieldName}` : fieldName);
    } else if (fieldData.type === String || fieldData.enum || fieldData.type === Number || fieldData.type === Boolean) {
      continue;
    } else {
      setJsonFieldsKey(key, objSchema[fieldName], fieldName);
    }
  }
}
