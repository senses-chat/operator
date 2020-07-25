import { Module } from '@nestjs/common';

import { HealthModule } from './health';

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
