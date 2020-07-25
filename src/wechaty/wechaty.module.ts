import { Module } from '@nestjs/common';

import { ConfigModule } from 'src/modules';
import { WechatyService } from './wechaty.service';

@Module({
  imports: [ConfigModule],
  providers: [WechatyService],
  exports: [WechatyService],
})
export class WechatyModule {}
