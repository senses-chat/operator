import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule, ConfigModule } from 'src/modules';
import { MinioModule } from 'src/minio';

import { WechatyBot } from './models';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WechatySagas } from './sagas';
import { WechatyService } from './wechaty.service';

@Module({
  imports: [CqrsModule, ConfigModule, RedisModule, MinioModule, TypeOrmModule.forFeature([WechatyBot])],
  providers: [WechatyService, WechatySagas, ...CommandHandlers, ...EventHandlers],
})
export class WechatyModule {}
