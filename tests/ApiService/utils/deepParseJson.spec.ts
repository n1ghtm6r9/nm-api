import { deepParseJson } from '../../../src/ApiService/utils/deepParseJson';

describe('deepParseJson', () => {
  it('should return non-object values as-is', () => {
    expect(deepParseJson(null)).toBeNull();
    expect(deepParseJson(undefined)).toBeUndefined();
    expect(deepParseJson(123)).toBe(123);
    expect(deepParseJson('hello')).toBe('hello');
    expect(deepParseJson(true)).toBe(true);
  });

  it('should parse string that looks like JSON object', () => {
    const data = { config: '{"foo":"bar"}' };
    const result = deepParseJson(data);
    expect(result.config).toEqual({ foo: 'bar' });
  });

  it('should parse string that looks like JSON array', () => {
    const data = { items: '[1,2,3]' };
    const result = deepParseJson(data);
    expect(result.items).toEqual([1, 2, 3]);
  });

  it('should leave non-JSON strings as-is', () => {
    const data = { id: '123', name: 'hello' };
    const result = deepParseJson(data);
    expect(result.id).toBe('123');
    expect(result.name).toBe('hello');
  });

  it('should handle invalid JSON gracefully', () => {
    const data = { config: '{invalid json' };
    const result = deepParseJson(data);
    expect(result.config).toBe('{invalid json');
  });

  it('should parse JSON strings inside arrays', () => {
    const data = { items: ['{"x":1}', '{"y":2}'] };
    const result = deepParseJson(data);
    expect(result.items).toEqual([{ x: 1 }, { y: 2 }]);
  });

  it('should keep non-JSON strings inside arrays as-is', () => {
    const data = { tags: ['a', 'b', 'c'] };
    const result = deepParseJson(data);
    expect(result.tags).toEqual(['a', 'b', 'c']);
  });

  it('should handle nested parsed objects', () => {
    const data = { outer: '{"inner":{"key":"val"}}' };
    const result = deepParseJson(data);
    expect(result.outer).toEqual({ inner: { key: 'val' } });
  });

  it('should handle empty input object', () => {
    const result = deepParseJson({});
    expect(result).toEqual({});
  });

  it('should handle valid JSON primitive values (not object-like)', () => {
    const data = { value: '"just a string"' };
    const result = deepParseJson(data);
    expect(result.value).toBe('"just a string"');
  });

  it('should not parse Date instances', () => {
    const date = new Date();
    const data = { createdAt: date };
    const result = deepParseJson(data);
    expect(result.createdAt).toBe(date);
  });

  it('should handle arrays with mixed JSON and non-JSON strings', () => {
    const data = { items: ['{"x":1}', 'plain string', '{"y":2}'] };
    const result = deepParseJson(data);
    expect(result.items).toEqual([{ x: 1 }, 'plain string', { y: 2 }]);
  });
});
