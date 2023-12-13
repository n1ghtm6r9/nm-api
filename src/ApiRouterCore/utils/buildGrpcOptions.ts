import { GrpcOptions, Transport } from '@nestjs/microservices';
import { IBuildGrpcOptions } from '../interfaces';

export const buildGrpcOptions = ({ host, port, packages, protoPaths }: IBuildGrpcOptions): GrpcOptions => ({
  transport: Transport.GRPC,
  options: {
    url: `${host || '127.0.0.1'}:${port || 6000}`,
    package: packages,
    protoPath: protoPaths,
    keepalive: {
      keepaliveTimeMs: 40000,
      keepaliveTimeoutMs: 20000,
      keepalivePermitWithoutCalls: 1,
    },
    channelOptions: {
      'grpc.use_local_subchannel_pool': 0,
      'grpc.default_compression_algorithm': 2,
      'grpc.default_compression_level': 3,
    },
    loader: {
      defaults: true,
      arrays: true,
      objects: true,
    },
  },
});
