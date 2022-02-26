import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { StorageModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';

import wx3pConfig from './3rdparty.config';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WechatSagas } from './sagas';

import { WechatController } from './wechat.controller';
import { WechatService } from './wechat.service';
import { Wechat3rdPartyService } from './3rdparty.service';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    ConfigModule.forFeature(wx3pConfig),
    StorageModule.register(),
  ],
  controllers: [WechatController],
  providers: [
    WechatService,
    Wechat3rdPartyService,
    WechatSagas,
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class WechatModule {}
