import 'reflect-metadata';
import { GenerateProtoMessagesService } from '../../../src/GrpcTransport/services/GenerateProtoMessagesService';

describe('GenerateProtoMessagesService', () => {
  const service = new GenerateProtoMessagesService();

  it('should generate empty message when objSchema is null', () => {
    const result = service.call({
      messageName: 'EmptyRequest',
      objSchema: null,
      existMessageNames: [],
    });
    expect(result.data).toEqual(['message EmptyRequest {}\n\n']);
    expect(result.messageNames).toEqual(['EmptyRequest']);
  });

  it('should skip already existing message names', () => {
    const result = service.call({
      messageName: 'ExistingMessage',
      objSchema: null,
      existMessageNames: ['ExistingMessage'],
    });
    expect(result.data).toEqual([]);
    expect(result.messageNames).toEqual([]);
  });

  it('should generate message with string field', () => {
    const schema = {};
    Reflect.defineMetadata('field:name', { type: String }, schema);

    const result = service.call({
      messageName: 'TestMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('message TestMessage {');
    expect(output).toContain('string name = 1;');
    expect(result.messageNames).toEqual(['TestMessage']);
  });

  it('should generate message with number field as double', () => {
    const schema = {};
    Reflect.defineMetadata('field:count', { type: Number }, schema);

    const result = service.call({
      messageName: 'NumberMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('double count = 1;');
  });

  it('should generate message with boolean field', () => {
    const schema = {};
    Reflect.defineMetadata('field:active', { type: Boolean }, schema);

    const result = service.call({
      messageName: 'BoolMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('bool active = 1;');
  });

  it('should generate message with repeated field', () => {
    const schema = {};
    Reflect.defineMetadata('field:items', { type: String, array: true }, schema);

    const result = service.call({
      messageName: 'ArrayMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('repeated string items = 1;');
  });

  it('should generate message with enum field as string', () => {
    const schema = {};
    Reflect.defineMetadata('field:status', { type: String, enum: true }, schema);

    const result = service.call({
      messageName: 'EnumMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('string status = 1;');
  });

  it('should generate message with Object type as string', () => {
    const schema = {};
    Reflect.defineMetadata('field:data', { type: Object }, schema);

    const result = service.call({
      messageName: 'ObjectMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('string data = 1;');
  });

  it('should generate message with JSON type as string', () => {
    const schema = {};
    Reflect.defineMetadata('field:payload', { type: JSON }, schema);

    const result = service.call({
      messageName: 'JsonMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('string payload = 1;');
  });

  it('should generate nested message for custom type', () => {
    const nestedSchema: any = { name: 'NestedType' };
    Reflect.defineMetadata('field:inner', { type: String }, nestedSchema);

    const schema = {};
    Reflect.defineMetadata('field:nested', { type: nestedSchema }, schema);

    const result = service.call({
      messageName: 'ParentMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('message ParentMessage {');
    expect(output).toContain('NestedType nested = 1;');
    expect(output).toContain('message NestedType {');
    expect(output).toContain('string inner = 1;');
  });

  it('should handle multiple fields with correct indices', () => {
    const schema = {};
    Reflect.defineMetadata('field:name', { type: String }, schema);
    Reflect.defineMetadata('field:age', { type: Number }, schema);
    Reflect.defineMetadata('field:active', { type: Boolean }, schema);

    const result = service.call({
      messageName: 'MultiFieldMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('= 1;');
    expect(output).toContain('= 2;');
    expect(output).toContain('= 3;');
  });

  it('should replace $ and _ in type names', () => {
    const nestedSchema: any = { name: 'My$Type_Name' };
    Reflect.defineMetadata('field:val', { type: String }, nestedSchema);

    const schema = {};
    Reflect.defineMetadata('field:item', { type: nestedSchema }, schema);

    const result = service.call({
      messageName: 'SpecialCharsMessage',
      objSchema: schema,
      existMessageNames: [],
    });

    const output = result.data.join('');
    expect(output).toContain('MySSTypeTTName item = 1;');
  });
});
