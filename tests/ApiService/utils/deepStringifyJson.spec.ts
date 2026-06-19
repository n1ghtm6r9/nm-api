import { deepStringifyJson } from '../../../src/ApiService/utils/deepStringifyJson';

describe('deepStringifyJson', () => {
  it('should return non-object values as-is', () => {
    expect(deepStringifyJson(null)).toBeNull();
    expect(deepStringifyJson(undefined)).toBeUndefined();
    expect(deepStringifyJson(123)).toBe(123);
    expect(deepStringifyJson('hello')).toBe('hello');
    expect(deepStringifyJson(true)).toBe(true);
  });

  it('should stringify plain object values', () => {
    const data = { config: { foo: 'bar' } };
    const result = deepStringifyJson(data);
    expect(result.config).toBe('{"foo":"bar"}');
  });

  it('should keep primitive values as-is', () => {
    const data = { id: '123', name: 'test', count: 42 };
    const result = deepStringifyJson(data);
    expect(result.id).toBe('123');
    expect(result.name).toBe('test');
    expect(result.count).toBe(42);
  });

  it('should not stringify Date instances', () => {
    const date = new Date('2025-01-01');
    const data = { createdAt: date };
    const result = deepStringifyJson(data);
    expect(result.createdAt).toBe(date);
  });

  it('should not stringify Buffer instances', () => {
    const buf = Buffer.from('hello');
    const data = { payload: buf };
    const result = deepStringifyJson(data);
    expect(result.payload).toBe(buf);
  });

  it('should stringify objects inside arrays', () => {
    const data = { items: [{ x: 1 }, { y: 2 }] };
    const result = deepStringifyJson(data);
    expect(result.items).toEqual(['{"x":1}', '{"y":2}']);
  });

  it('should keep primitives inside arrays as-is', () => {
    const data = { tags: ['a', 'b', 'c'] };
    const result = deepStringifyJson(data);
    expect(result.tags).toEqual(['a', 'b', 'c']);
  });

  it('should handle nested objects', () => {
    const data = { outer: { inner: { key: 'val' } } };
    const result = deepStringifyJson(data);
    expect(result.outer).toBe('{"inner":{"key":"val"}}');
  });

  it('should handle empty objects', () => {
    const data = { empty: {} };
    const result = deepStringifyJson(data);
    expect(result.empty).toBe('{}');
  });

  it('should handle empty input object', () => {
    const result = deepStringifyJson({});
    expect(result).toEqual({});
  });

  it('should handle arrays with mixed types', () => {
    const data = { items: [{ x: 1 }, 'string', null, 42] };
    const result = deepStringifyJson(data);
    expect(result.items).toEqual(['{"x":1}', 'string', null, 42]);
  });
});
