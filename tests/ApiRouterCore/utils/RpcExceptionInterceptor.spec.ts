import { of, throwError } from 'rxjs';

jest.mock('@nmxjs/utils', () => ({
  uuid: () => 'test-uuid-123',
  readableJson: (data: any) => JSON.stringify(data),
}));

import { RpcExceptionInterceptor } from '../../../src/ApiRouterCore/utils/RpcExceptionInterceptor';
import { Logger } from '@nestjs/common';
import { endErrorText } from '../../../src/ApiRouterCore/constants/endErrorText';

beforeEach(() => {
  jest.clearAllMocks();
});

const createContext = (data: any, pathOrEvent?: { path?: string; event?: string }) => ({
  getArgByIndex: (index: number) => {
    if (index === 0) return data;
    if (index === 1) return { args: [pathOrEvent?.event || 'test.event'] };
    if (index === 2) return pathOrEvent?.path ? { path: pathOrEvent.path } : undefined;
    return undefined;
  },
});

const createNext = (returnValue: any) => ({
  handle: () => of(returnValue),
});

const createErrorNext = (error: Error) => ({
  handle: () => throwError(() => error),
});

describe('RpcExceptionInterceptor', () => {
  it('should pass through successful responses', done => {
    const interceptor = new RpcExceptionInterceptor('test-service');
    const ctx = createContext({ id: 1 });
    const next = createNext({ result: 'ok' });

    interceptor.intercept(ctx as any, next as any).subscribe(result => {
      expect(result).toEqual({ result: 'ok' });
      done();
    });
  });

  it('should log debug on request when debug=true', done => {
    const interceptor = new RpcExceptionInterceptor('test-service', true);
    const ctx = createContext({ id: 1 }, { event: 'test.get' });
    const next = createNext({ ok: true });

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(Logger.debug).toHaveBeenCalled();
      done();
    });
  });

  it('should not log debug when debug=false', done => {
    const interceptor = new RpcExceptionInterceptor('test-service', false);
    const ctx = createContext({ id: 1 });
    const next = createNext({ ok: true });

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      expect(Logger.debug).not.toHaveBeenCalled();
      done();
    });
  });

  it('should throw RpcException on error', done => {
    const interceptor = new RpcExceptionInterceptor('test-service');
    const ctx = createContext({ id: 1 });
    const error = new Error('Something went wrong');
    const next = createErrorNext(error);

    interceptor.intercept(ctx as any, next as any).subscribe({
      error: err => {
        expect(err.message).toContain('Something went wrong');
        expect(err.message).toContain(endErrorText);
        done();
      },
    });
  });

  it('should log error message', done => {
    const interceptor = new RpcExceptionInterceptor('test-service');
    const ctx = createContext({ id: 1 });
    const error = new Error('Test error');
    const next = createErrorNext(error);

    interceptor.intercept(ctx as any, next as any).subscribe({
      error: () => {
        expect(Logger.error).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle error with endErrorText split', done => {
    const interceptor = new RpcExceptionInterceptor('test-service');
    const ctx = createContext({});
    const error = new Error(`Original error${endErrorText}extra`);
    const next = createErrorNext(error);

    interceptor.intercept(ctx as any, next as any).subscribe({
      error: err => {
        expect(err.message).toContain('Original error');
        done();
      },
    });
  });

  it('should call notifier.sendError when notifier is provided and error is not silent', done => {
    const notifier = { sendError: jest.fn() };
    const interceptor = new RpcExceptionInterceptor('test-service', false, notifier as any);
    const ctx = createContext({ id: 1 }, { path: '/test/path' });
    const error: any = new Error('Notify error');
    error.code = 'ERR_CODE';
    const next = createErrorNext(error);

    interceptor.intercept(ctx as any, next as any).subscribe({
      error: () => {
        expect(notifier.sendError).toHaveBeenCalledWith(
          expect.objectContaining({
            serviceName: 'test-service',
            path: '/test/path',
            code: 'ERR_CODE',
          }),
        );
        done();
      },
    });
  });

  it('should not call notifier when error is silent', done => {
    const notifier = { sendError: jest.fn() };
    const interceptor = new RpcExceptionInterceptor('test-service', false, notifier as any);
    const ctx = createContext({});
    const error: any = new Error('Silent error');
    error.silent = true;
    const next = createErrorNext(error);

    interceptor.intercept(ctx as any, next as any).subscribe({
      error: () => {
        expect(notifier.sendError).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should use UNKNOWN RPC code when error has no code', done => {
    const notifier = { sendError: jest.fn() };
    const interceptor = new RpcExceptionInterceptor('test-service', false, notifier as any);
    const ctx = createContext({}, { path: '/test' });
    const error = new Error('No code error');
    const next = createErrorNext(error);

    interceptor.intercept(ctx as any, next as any).subscribe({
      error: () => {
        expect(notifier.sendError).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNKNOWN RPC',
          }),
        );
        done();
      },
    });
  });

  it('should log debug response when debug=true and path is provided', done => {
    const interceptor = new RpcExceptionInterceptor('test-service', true);
    const ctx = createContext({ id: 1 }, { path: '/grpc/method' });
    const next = createNext({ data: 'response' });

    interceptor.intercept(ctx as any, next as any).subscribe(() => {
      const debugCalls = (Logger.debug as jest.Mock).mock.calls;
      expect(debugCalls.length).toBeGreaterThanOrEqual(2);
      done();
    });
  });
});
