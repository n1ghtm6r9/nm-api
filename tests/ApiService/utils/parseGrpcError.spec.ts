import { parseGrpcError } from '../../../src/ApiService/utils/parseGrpcError';
import { endErrorText } from '../../../src/ApiRouterCore/constants/endErrorText';

describe('parseGrpcError', () => {
  it('should parse JSON details with message, code and statusCode', () => {
    const payload = JSON.stringify({ message: 'Validation failed', code: 'VALIDATION_ERROR', statusCode: 400 });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result: any = parseGrpcError(grpcError);

    expect(result.message).toBe('Validation failed');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.statusCode).toBe(400);
  });

  it('should parse JSON details with only message', () => {
    const payload = JSON.stringify({ message: 'Something broke' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result = parseGrpcError(grpcError);

    expect(result.message).toBe('Something broke');
  });

  it('should handle plain text details (not JSON)', () => {
    const grpcError = { details: `Plain error text${endErrorText}` };
    const result = parseGrpcError(grpcError);

    expect(result.message).toBe('Plain error text');
  });

  it('should handle details without endErrorText marker', () => {
    const payload = JSON.stringify({ message: 'Error without marker', code: 'ERR' });
    const grpcError = { details: payload };
    const result: any = parseGrpcError(grpcError);

    expect(result.message).toBe('Error without marker');
    expect(result.code).toBe('ERR');
  });

  it('should fallback to details as message when JSON has no message field', () => {
    const payload = JSON.stringify({ code: 'UNKNOWN' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result = parseGrpcError(grpcError);

    expect(result.message).toBe(payload);
  });

  it('should not set code if not present in parsed JSON', () => {
    const payload = JSON.stringify({ message: 'No code error' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result: any = parseGrpcError(grpcError);

    expect(result.message).toBe('No code error');
    expect(result.code).toBeUndefined();
  });

  it('should not set statusCode if not present in parsed JSON', () => {
    const payload = JSON.stringify({ message: 'No status error' });
    const grpcError = { details: `${payload}${endErrorText}` };
    const result: any = parseGrpcError(grpcError);

    expect(result.statusCode).toBeUndefined();
  });

  it('should handle cascade errors (multiple endErrorText markers)', () => {
    const payload = JSON.stringify({ message: 'Original cascade error', code: 'CASCADE' });
    const grpcError = { details: `${payload}${endErrorText}${endErrorText}` };
    const result: any = parseGrpcError(grpcError);

    expect(result.message).toBe('Original cascade error');
    expect(result.code).toBe('CASCADE');
  });

  it('should return Error instance', () => {
    const payload = JSON.stringify({ message: 'test' });
    const grpcError = { details: payload };
    const result = parseGrpcError(grpcError);

    expect(result).toBeInstanceOf(Error);
  });
});
