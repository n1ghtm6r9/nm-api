import { transformParseJson } from '../../../src/ApiService/utils/transformParseJson';
import * as jsonFieldsKeysModule from '../../../src/ApiService/utils/getJsonFieldsKeys';

jest.spyOn(jsonFieldsKeysModule, 'getJsonFieldsKeys');

const mockGetJsonFieldsKeys = jsonFieldsKeysModule.getJsonFieldsKeys as jest.Mock;

beforeEach(() => {
  mockGetJsonFieldsKeys.mockReset();
});

describe('transformParseJson', () => {
  it('should return data as-is when no jsonFieldsKeys', () => {
    mockGetJsonFieldsKeys.mockReturnValue(undefined);
    const data = { name: 'test' };
    expect(transformParseJson('key', data)).toEqual({ name: 'test' });
  });

  it('should not crash when data={} and jsonFieldsKeys=["filters.value"]', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const result = transformParseJson('key', {});
    expect(result).toEqual({});
  });

  it('should not crash when data={ filters: undefined } and jsonFieldsKeys=["filters.value"]', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const result = transformParseJson('key', { filters: undefined });
    expect(result).toEqual({ filters: undefined });
  });

  it('should parse nested array values for "filters.value"', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const data = { filters: [{ value: '["a","b"]' }] };
    const result = transformParseJson('key', data);
    expect(result.filters[0].value).toEqual(['a', 'b']);
  });

  it('should parse nested string values for "filters.value"', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const data = { filters: [{ value: '"test"' }] };
    const result = transformParseJson('key', data);
    expect(result.filters[0].value).toBe('test');
  });

  it('should parse top-level key for "name"', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['name']);
    const data = { name: '"test"' };
    const result = transformParseJson('key', data);
    expect(result.name).toBe('test');
  });

  it('should not crash when data={} and jsonFieldsKeys=["name"]', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['name']);
    const result = transformParseJson('key', {});
    expect(result).toEqual({});
  });

  it('should not crash when data is undefined', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const result = transformParseJson('key', undefined);
    expect(result).toBeUndefined();
  });

  it('should not crash when data is null', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['name']);
    const result = transformParseJson('key', null);
    expect(result).toBeNull();
  });

  it('should parse non-array object value with secondKey', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['filters.value']);
    const data = { filters: { value: '{"nested":true}' } };
    const result = transformParseJson('key', data);
    expect(result.filters.value).toEqual({ nested: true });
  });

  it('should not crash when nested value is null', () => {
    mockGetJsonFieldsKeys.mockReturnValue(['item.config']);
    const result = transformParseJson('key', { item: null });
    expect(result).toEqual({ item: null });
  });
});
