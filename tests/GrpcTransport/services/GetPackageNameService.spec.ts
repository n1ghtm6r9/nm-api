import { GetPackageNameService } from '../../../src/GrpcTransport/services/GetPackageNameService';

describe('GetPackageNameService', () => {
  const service = new GetPackageNameService();

  it('should return single word as-is', () => {
    expect(service.call('users')).toBe('users');
  });

  it('should camelCase hyphenated service name', () => {
    expect(service.call('user-service')).toBe('userService');
  });

  it('should handle multiple hyphens', () => {
    expect(service.call('my-long-service')).toBe('myLongService');
  });

  it('should capitalize first letter of each part except first', () => {
    expect(service.call('api-gateway-service')).toBe('apiGatewayService');
  });

  it('should handle two-letter parts', () => {
    expect(service.call('a-b')).toBe('aB');
  });
});
