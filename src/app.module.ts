import { Module } from '@nestjs/common';

import { RouteModule } from './route';
import { HealthModule } from './health';

@Module({
  imports: [HealthModule, RouteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
