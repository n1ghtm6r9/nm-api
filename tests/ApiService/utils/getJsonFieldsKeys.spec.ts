import 'reflect-metadata';
import { setJsonFieldsKey, getJsonFieldsKeys } from '../../../src/ApiService/utils/getJsonFieldsKeys';

describe('getJsonFieldsKeys', () => {
  it('should return undefined for unknown key', () => {
    expect(getJsonFieldsKeys('unknown-key')).toBeUndefined();
  });

  it('should return empty array when objSchema is null', () => {
    setJsonFieldsKey('null-schema', null);
    expect(getJsonFieldsKeys('null-schema')).toBeUndefined();
  });

  it('should return empty array when objSchema has no field metadata', () => {
    const schema = {};
    setJsonFieldsKey('empty-schema', schema);
    expect(getJsonFieldsKeys('empty-schema')).toEqual([]);
  });

  it('should register JSON type field as json field key', () => {
    const schema = {};
    Reflect.defineMetadata('field:value', { type: JSON }, schema);
    setJsonFieldsKey('json-field', schema);
    expect(getJsonFieldsKeys('json-field')).toEqual(['value']);
  });

  it('should register Object type field as json field key', () => {
    const schema = {};
    Reflect.defineMetadata('field:data', { type: Object }, schema);
    setJsonFieldsKey('object-field', schema);
    expect(getJsonFieldsKeys('object-field')).toEqual(['data']);
  });

  it('should skip String type fields', () => {
    const schema = {};
    Reflect.defineMetadata('field:name', { type: String }, schema);
    setJsonFieldsKey('string-field', schema);
    expect(getJsonFieldsKeys('string-field')).toEqual([]);
  });

  it('should skip Number type fields', () => {
    const schema = {};
    Reflect.defineMetadata('field:count', { type: Number }, schema);
    setJsonFieldsKey('number-field', schema);
    expect(getJsonFieldsKeys('number-field')).toEqual([]);
  });

  it('should skip Boolean type fields', () => {
    const schema = {};
    Reflect.defineMetadata('field:active', { type: Boolean }, schema);
    setJsonFieldsKey('bool-field', schema);
    expect(getJsonFieldsKeys('bool-field')).toEqual([]);
  });

  it('should skip enum fields', () => {
    const schema = {};
    Reflect.defineMetadata('field:status', { type: String, enum: true }, schema);
    setJsonFieldsKey('enum-field', schema);
    expect(getJsonFieldsKeys('enum-field')).toEqual([]);
  });

  it('should recurse into nested types and collect with prefix', () => {
    const nestedSchema = {};
    Reflect.defineMetadata('field:value', { type: JSON }, nestedSchema);

    const schema = {};
    Reflect.defineMetadata('field:filters', { type: nestedSchema }, schema);

    setJsonFieldsKey('nested-field', schema);
    expect(getJsonFieldsKeys('nested-field')).toEqual(['filters.value']);
  });

  it('should handle multiple fields', () => {
    const schema = {};
    Reflect.defineMetadata('field:name', { type: String }, schema);
    Reflect.defineMetadata('field:data', { type: JSON }, schema);
    Reflect.defineMetadata('field:count', { type: Number }, schema);

    setJsonFieldsKey('multi-field', schema);
    expect(getJsonFieldsKeys('multi-field')).toEqual(['data']);
  });

  it('should not recurse deeper than 2 levels', () => {
    const deepSchema = {};
    Reflect.defineMetadata('field:deep', { type: JSON }, deepSchema);

    const midSchema = {};
    Reflect.defineMetadata('field:mid', { type: deepSchema }, midSchema);

    const schema = {};
    Reflect.defineMetadata('field:top', { type: midSchema }, schema);

    setJsonFieldsKey('deep-nested', schema);
    const result = getJsonFieldsKeys('deep-nested');
    expect(result).toContain('mid.deep');
    expect(result.length).toBe(1);
  });

  it('should ignore non-field metadata keys', () => {
    const schema = {};
    Reflect.defineMetadata('other:key', { type: JSON }, schema);
    Reflect.defineMetadata('field:value', { type: JSON }, schema);

    setJsonFieldsKey('filter-meta', schema);
    expect(getJsonFieldsKeys('filter-meta')).toEqual(['value']);
  });
});
