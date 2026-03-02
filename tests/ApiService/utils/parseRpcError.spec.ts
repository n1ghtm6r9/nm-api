import { parseRpcError } from '../../../src/ApiService/utils/parseRpcError';
import { endErrorText } from '../../../src/ApiRouterCore/constants/endErrorText';

describe('parseRpcError', () => {
  it('should parse JSON details with message, code and statusCode', () => {
    const payload = JSON.stringify({ message: 'Validation failed', code: 'VALIDATION_ERROR', statusCode: 400 });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result: any = parseRpcError(grpcError);

    expect(result.message).toBe('Validation failed');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.statusCode).toBe(400);
  });

  it('should parse JSON details with only message', () => {
    const payload = JSON.stringify({ message: 'Something broke' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result = parseRpcError(grpcError);

    expect(result.message).toBe('Something broke');
  });

  it('should handle plain text details (not JSON)', () => {
    const grpcError = { details: `Plain error text${endErrorText}` };
    const result = parseRpcError(grpcError);

    expect(result).toBe(grpcError);
  });

  it('should handle details without endErrorText marker', () => {
    const payload = JSON.stringify({ message: 'Error without marker', code: 'ERR' });
    const grpcError = { details: payload };
    const result: any = parseRpcError(grpcError);

    expect(result).toBe(grpcError);
  });

  it('should fallback to details as message when JSON has no message field', () => {
    const payload = JSON.stringify({ code: 'UNKNOWN' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result = parseRpcError(grpcError);

    expect(result.message).toBe(payload);
  });

  it('should not set code if not present in parsed JSON', () => {
    const payload = JSON.stringify({ message: 'No code error' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result: any = parseRpcError(grpcError);

    expect(result.message).toBe('No code error');
    expect(result.code).toBeUndefined();
  });

  it('should not set statusCode if not present in parsed JSON', () => {
    const payload = JSON.stringify({ message: 'No status error' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result: any = parseRpcError(grpcError);

    expect(result.statusCode).toBeUndefined();
  });

  it('should handle cascade errors (multiple endErrorText markers)', () => {
    const payload = JSON.stringify({ message: 'Original cascade error', code: 'CASCADE' });
    const grpcError = { details: `${payload}${endErrorText}${endErrorText}` };
    const result: any = parseRpcError(grpcError);

    expect(result.message).toBe('Original cascade error');
    expect(result.code).toBe('CASCADE');
  });

  it('should return original error when no endErrorText marker', () => {
    const payload = JSON.stringify({ message: 'test' });
    const grpcError = { details: payload };
    const result = parseRpcError(grpcError);

    expect(result).toBe(grpcError);
  });

  it('should parse error.message when details is absent (NATS/TCP)', () => {
    const payload = JSON.stringify({ message: 'Invalid credentials!', code: 'INVALID_CREDENTIALS_ERROR', statusCode: 401 });
    const error = new Error(`${payload}${endErrorText}`);
    const result: any = parseRpcError(error);

    expect(result.message).toBe('Invalid credentials!');
    expect(result.code).toBe('INVALID_CREDENTIALS_ERROR');
    expect(result.statusCode).toBe(401);
  });

  it('should parse error.message with only message field (NATS/TCP)', () => {
    const payload = JSON.stringify({ message: 'Something broke' });
    const error = new Error(`${payload}${endErrorText}`);
    const result: any = parseRpcError(error);

    expect(result.message).toBe('Something broke');
    expect(result.code).toBeUndefined();
  });

  it('should prefer details over message when both present', () => {
    const payload = JSON.stringify({ message: 'From details', code: 'DETAILS' });
    const error: any = new Error('from message');
    error.details = `${payload}${endErrorText}`;
    const result: any = parseRpcError(error);

    expect(result.message).toBe('From details');
    expect(result.code).toBe('DETAILS');
  });

  it('should preserve code and statusCode for non-RPC errors', () => {
    const error: any = new Error('Invalid credentials!');
    error.code = 'INVALID_CREDENTIALS_ERROR';
    error.statusCode = 401;
    const result: any = parseRpcError(error);

    expect(result).toBe(error);
    expect(result.message).toBe('Invalid credentials!');
    expect(result.code).toBe('INVALID_CREDENTIALS_ERROR');
    expect(result.statusCode).toBe(401);
  });
});
