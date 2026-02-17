import { of } from 'rxjs';

jest.mock('../../../src/ApiService/utils/transformParseJson', () => ({
  transformParseJson: jest.fn((key: string, data: any) => data),
}));

jest.mock('../../../src/ApiService/utils/transformStringifyJson', () => ({
  transformStringifyJson: jest.fn((key: string, data: any) => data),
}));

import { GrpcInterceptor } from '../../../src/GrpcTransport/interceptors/GrpcInterceptor';
import { transformParseJson } from '../../../src/ApiService/utils/transformParseJson';
import { transformStringifyJson } from '../../../src/ApiService/utils/transformStringifyJson';

const mockTransformParseJson = transformParseJson as jest.Mock;
const mockTransformStringifyJson = transformStringifyJson as jest.Mock;

beforeEach(() => {
  mockTransformParseJson.mockClear();
  mockTransformStringifyJson.mockClear();
});

describe('GrpcInterceptor', () => {
  const key = 'service.method';
  const interceptor = new GrpcInterceptor(key);

  const createContext = (data: any) => ({
    switchToRpc: () => ({
      getData: () => data,
    }),
  });

  const createNext = (returnValue: any) => ({
    handle: () => of(returnValue),
  });

  it('should call transformParseJson with request key and data', done => {
    const requestData = { name: 'test' };
    const ctx = createContext(requestData);
    const next = createNext({ result: 'ok' });

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(mockTransformParseJson).toHaveBeenCalledWith(`${key}.request`, requestData);
      done();
    });
  });

  it('should call transformStringifyJson on response', done => {
    const responseData = { result: 'ok' };
    const ctx = createContext({});
    const next = createNext(responseData);

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(mockTransformStringifyJson).toHaveBeenCalledWith(`${key}.response`, responseData);
      done();
    });
  });

  it('should return transformed response', done => {
    mockTransformStringifyJson.mockImplementation((_, data) => ({ ...data, transformed: true }));

    const ctx = createContext({});
    const next = createNext({ value: 42 });

    interceptor.intercept(ctx as any, next as any).subscribe(result => {
      expect(result).toEqual({ value: 42, transformed: true });
      done();
    });
  });

  it('should use correct key prefix', done => {
    const customInterceptor = new GrpcInterceptor('myService.myMethod');
    const ctx = createContext({ id: 1 });
    const next = createNext({ ok: true });

    customInterceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(mockTransformParseJson).toHaveBeenCalledWith('myService.myMethod.request', { id: 1 });
      expect(mockTransformStringifyJson).toHaveBeenCalledWith('myService.myMethod.response', { ok: true });
      done();
    });
  });
});
