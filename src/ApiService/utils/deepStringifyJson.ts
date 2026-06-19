export function deepStringifyJson(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && !Buffer.isBuffer(val)) {
        data[i] = JSON.stringify(val);
      }
    }
    return data;
  }
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== null && val !== undefined && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && !Buffer.isBuffer(val)) {
      data[key] = JSON.stringify(val);
    } else if (Array.isArray(val)) {
      data[key] = val.map(v =>
        typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date) && !Buffer.isBuffer(v) ? JSON.stringify(v) : v,
      );
    }
  }
  return data;
}
