export function deepParseJson(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(v => deepParseJson(v));
  }
  const result: any = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try {
        result[key] = JSON.parse(val);
      } catch (e) {
        result[key] = val;
      }
    } else if (val !== null && typeof val === 'object') {
      result[key] = deepParseJson(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}
