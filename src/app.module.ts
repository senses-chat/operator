import { Module } from '@nestjs/common';

import { TypeOrmModule } from './modules';
import { HealthModule } from './health';
import { RouteModule } from './route';

@Module({
  imports: [TypeOrmModule, HealthModule, RouteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
