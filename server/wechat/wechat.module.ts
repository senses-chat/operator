import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, RedisModule } from 'server/modules';
import { MinioModule } from 'server/minio';

import { WechatApp } from './models';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WechatSagas } from './sagas';

import { WechatController } from './wechat.controller';
import { WecomController } from './wecom.controller';
import { WechatService } from './wechat.service';
import { WecomService } from './wecom.service';
import { Wechat3rdPartyService } from './3rdparty.service';

@Module({
  imports: [CqrsModule, ConfigModule, RedisModule, MinioModule, TypeOrmModule.forFeature([WechatApp])],
  controllers: [WechatController, WecomController],
  providers: [WechatService, WecomService, Wechat3rdPartyService, WechatSagas, ...CommandHandlers, ...EventHandlers],
})
export class WechatModule {}
