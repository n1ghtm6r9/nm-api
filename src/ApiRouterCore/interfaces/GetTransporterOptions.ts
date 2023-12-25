import { MicroserviceOptions } from '@nestjs/microservices';

export type GetTransporterOptions = (serviceName: string) => MicroserviceOptions;
