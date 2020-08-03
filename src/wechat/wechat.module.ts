import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from 'src/modules';
import { MinioModule } from 'src/minio';

import { WechatApp } from './models';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WechatSagas } from './sagas';
import { WechatService } from './wechat.service';
import { WechatController } from './wechat.controller';
import { Wechat3rdPartyService } from './3rdparty.service';

@Module({
  imports: [CqrsModule, RedisModule, MinioModule, TypeOrmModule.forFeature([WechatApp])],
  controllers: [WechatController],
  providers: [WechatService, Wechat3rdPartyService, WechatSagas, ...CommandHandlers, ...EventHandlers],
})
export class WechatModule {}
