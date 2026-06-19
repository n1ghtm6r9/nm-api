import { of } from 'rxjs';

jest.mock('../../../src/ApiService/utils/transformParseJson', () => ({
  transformParseJson: jest.fn((key: string, data: any) => data),
}));

jest.mock('../../../src/ApiService/utils/transformStringifyJson', () => ({
  transformStringifyJson: jest.fn((key: string, data: any) => data),
}));

jest.mock('../../../src/ApiService/utils/deepParseJson', () => ({
  deepParseJson: jest.fn((data: any) => data),
}));

jest.mock('../../../src/ApiService/utils/deepStringifyJson', () => ({
  deepStringifyJson: jest.fn((data: any) => data),
}));

import { GrpcInterceptor } from '../../../src/GrpcTransport/interceptors/GrpcInterceptor';
import { transformParseJson } from '../../../src/ApiService/utils/transformParseJson';
import { transformStringifyJson } from '../../../src/ApiService/utils/transformStringifyJson';
import { deepParseJson } from '../../../src/ApiService/utils/deepParseJson';
import { deepStringifyJson } from '../../../src/ApiService/utils/deepStringifyJson';

const mockTransformParseJson = transformParseJson as jest.Mock;
const mockTransformStringifyJson = transformStringifyJson as jest.Mock;
const mockDeepParseJson = deepParseJson as jest.Mock;
const mockDeepStringifyJson = deepStringifyJson as jest.Mock;

beforeEach(() => {
  mockTransformParseJson.mockReset();
  mockTransformStringifyJson.mockReset();
  mockDeepParseJson.mockReset();
  mockDeepStringifyJson.mockReset();
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

  it('should call deepParseJson on request data', done => {
    const requestData = { name: 'test' };
    const ctx = createContext(requestData);
    const next = createNext({ result: 'ok' });

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(mockDeepParseJson).toHaveBeenCalledWith(requestData);
      done();
    });
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

  it('should call deepStringifyJson on response', done => {
    const responseData = { result: 'ok' };
    const ctx = createContext({});
    const next = createNext(responseData);

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(mockDeepStringifyJson).toHaveBeenCalledWith(responseData);
      done();
    });
  });

  it('should call deepParseJson before transformParseJson', done => {
    const requestData = { name: 'test' };
    const ctx = createContext(requestData);
    const next = createNext({ ok: true });
    const callOrder: string[] = [];

    mockDeepParseJson.mockImplementation(() => callOrder.push('deepParse'));
    mockTransformParseJson.mockImplementation(() => callOrder.push('transformParse'));

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(callOrder).toEqual(['deepParse', 'transformParse']);
      done();
    });
  });

  it('should call transformStringifyJson before deepStringifyJson on response', done => {
    const responseData = { result: 'ok' };
    const ctx = createContext({});
    const next = createNext(responseData);
    const callOrder: string[] = [];

    mockTransformStringifyJson.mockImplementation(() => callOrder.push('transformStringify'));
    mockDeepStringifyJson.mockImplementation(() => callOrder.push('deepStringify'));

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(callOrder).toEqual(['transformStringify', 'deepStringify']);
      done();
    });
  });

  it('should return response with deep and specific transforms applied', done => {
    mockTransformStringifyJson.mockImplementation((_key, data) => {
      data.specific = true;
      return data;
    });
    mockDeepStringifyJson.mockImplementation(data => {
      data.deep = true;
      return data;
    });

    const ctx = createContext({});
    const next = createNext({ value: 42 });

    interceptor.intercept(ctx as any, next as any).subscribe(result => {
      expect(result).toEqual({ value: 42, specific: true, deep: true });
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
