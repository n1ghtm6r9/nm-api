export function deepParseJson(data: any): any {
  if (!data || typeof data !== 'object' || data instanceof Date) return data;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try {
          data[i] = JSON.parse(val);
        } catch (e) {
          /* keep original */
        }
      }
    }
    return data;
  }
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try {
        data[key] = JSON.parse(val);
      } catch (e) {
        /* keep original */
      }
    } else if (val !== null && typeof val === 'object') {
      deepParseJson(val);
    }
  }
  return data;
}
