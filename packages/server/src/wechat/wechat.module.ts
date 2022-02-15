import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigModule, StorageModule } from 'src/modules';
import { EventStoreModule } from 'src/event-store';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { WechatSagas } from './sagas';

import { WechatController } from './wechat.controller';
import { WechatService } from './wechat.service';
import { Wechat3rdPartyService } from './3rdparty.service';

@Module({
  imports: [
    CqrsModule,
    EventStoreModule,
    ConfigModule,
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
