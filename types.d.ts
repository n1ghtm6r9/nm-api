declare module '@nestjs/common' {
  class Logger {
    static debug(data);
    static error(data);
  }
  const Global = (): ClassDecorator => {};
  const Module = (data): ClassDecorator => {};
  const Inject: (data) => ParameterDecorator;
  const Injectable = (): ClassDecorator => {};
  interface OnApplicationShutdown {}
  type CallHandler = any;
  type ExecutionContext = any;
  interface NestInterceptor {}
  interface ModuleMetadata {
    imports: any[];
  }
  const Controller = () => data => {};
  const UseInterceptors =
    data =>
    (...params) => {};
  type DynamicModule = any;
}

declare module '@nestjs/microservices' {
  class RpcException {
    constructor(data) {}
  }
  type ClientNats = any;
  type ClientGrpc = any;
  type GrpcOptions = any;
  type TcpClientOptions = any;
  type NatsOptions = any;
  enum Transport {
    TCP,
    NATS,
    GRPC,
  }
  class ClientProxyFactory {
    static create(data);
  }
  type MicroserviceOptions = any;
  interface CustomStrategy {}
  const GrpcMethod =
    (...data) =>
    (...params) => {};
  const MessagePattern =
    data =>
    (...params) => {};
}

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
  const getConfig: () => IConfig;
}
