import { getJsonFieldsKeys } from './getJsonFieldsKeys';

const safeParse = (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value);

export function transformParseJson<T>(key: string, data: T): T {
  if (!data) {
    return data;
  }

  const jsonFieldsKeys = getJsonFieldsKeys(key);

  if (!jsonFieldsKeys || jsonFieldsKeys.length === 0) {
    return data;
  }

  for (const path of jsonFieldsKeys) {
    const [firstKey, secondKey] = path.split('.');

    if (typeof data[firstKey] === 'undefined' || data[firstKey] === null) {
      continue;
    }

    if (firstKey && !secondKey) {
      data[firstKey] = safeParse(data[firstKey]);
    } else if (Array.isArray(data[firstKey])) {
      data[firstKey].forEach(item => {
        if (item !== null && typeof item !== 'undefined') {
          item[secondKey] = safeParse(item[secondKey]);
        }
      });
    } else {
      data[firstKey][secondKey] = safeParse(data[firstKey][secondKey]);
    }
  }

  return data;
}
