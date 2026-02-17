export const Injectable = () => (target: any) => target;
export const Inject = () => () => {};
export const Module = () => (target: any) => target;
export const Global = () => (target: any) => target;
export const Controller = () => (target: any) => target;
export const UseInterceptors = () => () => {};

export const Logger = {
  debug: jest.fn(),
  error: jest.fn(),
};

export interface OnApplicationBootstrap {}
export interface OnApplicationShutdown {}
export type CallHandler = any;
export type ExecutionContext = any;
export interface NestInterceptor {}
export interface ModuleMetadata {
  imports: any[];
}
export type DynamicModule = any;
