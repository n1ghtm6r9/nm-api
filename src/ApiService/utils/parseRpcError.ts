import { endErrorText } from '../../ApiRouterCore/constants';

export function parseRpcError(e: any): Error {
  const raw: string = e.details ?? e.message ?? '';
  const cleanDetails = raw.split(endErrorText)[0];

  try {
    const parsed = JSON.parse(cleanDetails);
    const error: any = new Error(parsed.message || cleanDetails);
    if (parsed.code) error.code = parsed.code;
    if (parsed.statusCode) error.statusCode = parsed.statusCode;
    return error;
  } catch (parseError) {
    if (parseError instanceof SyntaxError) {
      return new Error(cleanDetails);
    }
    throw parseError;
  }
}
