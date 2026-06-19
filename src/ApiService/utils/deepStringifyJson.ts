export function deepStringifyJson(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(v => deepStringifyJson(v));
  }
  const result: any = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== null && val !== undefined && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && !Buffer.isBuffer(val)) {
      result[key] = JSON.stringify(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map(v => (typeof v === 'object' && v !== null && !(v instanceof Date) && !Buffer.isBuffer(v) ? JSON.stringify(v) : v));
    } else {
      result[key] = val;
    }
  }
  return result;
}
