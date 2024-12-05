import { getJsonFieldsKeys } from './getJsonFieldsKeys';

export function transformParseJson<T>(key: string, data: T): T {
  const jsonFieldsKeys = getJsonFieldsKeys(key);

  if (!jsonFieldsKeys || jsonFieldsKeys.length === 0) {
    return data;
  }

  for (const path of jsonFieldsKeys) {
    const [firstKey, secondKey] = path.split('.');

    if (firstKey && !secondKey) {
      data[firstKey] = JSON.parse(data[firstKey]);
    } else if (Array.isArray(data[firstKey])) {
      data[firstKey].forEach(item => {
        item[secondKey] = JSON.parse(item[secondKey]);
      });
    } else {
      data[firstKey][secondKey] = JSON.parse(data[firstKey][secondKey]);
    }
  }

  return data;
}
