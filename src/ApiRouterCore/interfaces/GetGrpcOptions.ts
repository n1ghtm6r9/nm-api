import { GrpcOptions } from '@nestjs/microservices';

export type GetGrpcOptions = (serviceName: string) => GrpcOptions;
