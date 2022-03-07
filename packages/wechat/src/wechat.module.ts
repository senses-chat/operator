import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { StorageModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';

import wechatConfig from './config';
import wx3pConfig from './3rdparty.config';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WechatSagas } from './sagas';

import { WechatController } from './wechat.controller';
import { Wechat3rdPartyService } from './3rdparty.service';
import { WechatServiceRegistry } from './wechat.registry';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    StorageModule.register(),
    ConfigModule.forFeature(wechatConfig),
    ConfigModule.forFeature(wx3pConfig),
  ],
  controllers: [WechatController],
  providers: [
    WechatServiceRegistry,
    Wechat3rdPartyService,
    WechatSagas,
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class WechatModule {}
