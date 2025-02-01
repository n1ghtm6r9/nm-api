import type { MicroserviceOptions, CustomStrategy } from '@nestjs/microservices';

export type GetTransporterOptions = (serviceName: string) => Exclude<MicroserviceOptions, CustomStrategy>;
