declare module '@nmxjs/config' {
  enum TransporterEnumType {
    NATS = 'nats',
    TCP = 'tcp',
    GRPC = 'grpc',
  }
  interface IConfig {
    transport?: {
      type: TransporterEnumType;
      services: Array<{
        name?: string;
        port?: number;
        host?: string;
      }>;
      keepaliveTimeMs?: number;
      keepaliveTimeoutMs?: number;
    };
  }
  const configKey: string;
}
