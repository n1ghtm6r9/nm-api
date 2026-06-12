import { transformStringifyJson } from '../../../src/ApiService/utils/transformStringifyJson';
import * as jsonFieldsKeysModule from '../../../src/ApiService/utils/getJsonFieldsKeys';

jest.spyOn(jsonFieldsKeysModule, 'getJsonFieldsKeys');

const mockGetJsonFieldsKeys = jsonFieldsKeysModule.getJsonFieldsKeys as jest.Mock;

beforeEach(() => {
  mockGetJsonFieldsKeys.mockReset();
});

describe('transformStringifyJson', () => {
  it('should return data as-is when no jsonFieldsKeys', () => {
    mockGetJsonFieldsKeys.mockReturnValue(undefined);
    const data = { name: 'test' };
    expect(transformStringifyJson('key', data)).toEqual({ name: 'test' });
  });

  it('should not crash when data={} and jsonFieldsKeys=["filters.value"]', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const result = transformStringifyJson('key', {});
    expect(result).toEqual({});
  });

  it('should not crash when data={ filters: undefined } and jsonFieldsKeys=["filters.value"]', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const result = transformStringifyJson('key', { filters: undefined });
    expect(result).toEqual({ filters: undefined });
  });

  it('should stringify nested array values for "filters.value"', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const data = { filters: [{ value: ['a', 'b'] }] };
    const result = transformStringifyJson('key', data);
    expect(result.filters[0].value).toBe('["a","b"]');
  });

  it('should stringify nested string values for "filters.value"', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const data = { filters: [{ value: 'test' }] };
    const result = transformStringifyJson('key', data);
    expect(result.filters[0].value).toBe('"test"');
  });

  it('should stringify top-level key for "name"', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['name']);
    const data = { name: 'test' };
    const result = transformStringifyJson('key', data);
    expect(result.name).toBe('"test"');
  });

  it('should not crash when data={} and jsonFieldsKeys=["name"]', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['name']);
    const result = transformStringifyJson('key', {});
    expect(result).toEqual({});
  });

  it('should not crash when data is undefined', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const result = transformStringifyJson('key', undefined);
    expect(result).toBeUndefined();
  });

  it('should not crash when data is null', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['name']);
    const result = transformStringifyJson('key', null);
    expect(result).toBeNull();
  });

  it('should stringify non-array object value with secondKey', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const data = { filters: { value: { nested: true } } };
    const result = transformStringifyJson('key', data);
    expect(result.filters.value).toBe('{"nested":true}');
  });

  it('should not crash when nested value is null', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['item.config']);
    const result = transformStringifyJson('key', { item: null });
    expect(result).toEqual({ item: null });
  });
});
