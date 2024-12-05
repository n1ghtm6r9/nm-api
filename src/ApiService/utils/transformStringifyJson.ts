import { getJsonFieldsKeys } from './getJsonFieldsKeys';

export function transformStringifyJson<T>(key: string, data: T): T {
  const jsonFieldsKeys = getJsonFieldsKeys(this.key);

  if (!jsonFieldsKeys || jsonFieldsKeys.length === 0) {
    return data;
  }

  for (const path of jsonFieldsKeys) {
    const [firstKey, secondKey] = path.split('.');

    if (firstKey && !secondKey) {
      data[firstKey] = JSON.stringify(data[firstKey]);
    } else if (Array.isArray(data[firstKey])) {
      data[firstKey].forEach(item => {
        item[secondKey] = JSON.stringify(item[secondKey]);
      });
    } else {
      data[firstKey][secondKey] = JSON.stringify(data[firstKey][secondKey]);
    }
  }

  return data;
}
