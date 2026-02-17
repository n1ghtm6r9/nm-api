export class RpcException extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class ClientProxyFactory {
  static create(data: any) {
    return {};
  }
}

export enum Transport {
  TCP = 0,
  NATS = 1,
  GRPC = 2,
}

export type ClientNats = any;
export type ClientGrpc = any;
export type GrpcOptions = any;
export type TcpClientOptions = any;
export type NatsOptions = any;
export type MicroserviceOptions = any;
export interface CustomStrategy {}

export const GrpcMethod =
  (...args: any[]) =>
  (...params: any[]) => {};
export const MessagePattern =
  (data: any) =>
  (...params: any[]) => {};
