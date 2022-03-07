import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { StorageModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';

import wechatConfig from './config';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WechatSagas } from './sagas';

import { WechatController } from './wechat.controller';
import { WechatServiceRegistry } from './wechat.registry';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    StorageModule.register(),
    ConfigModule.forFeature(wechatConfig),
  ],
  controllers: [WechatController],
  providers: [
    WechatServiceRegistry,
    WechatSagas,
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class WechatModule {}
