import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreModule } from 'server/event-store';
import {
  ConfigModule,
  KeyValueStorageBase,
  MinioService,
  PrismaService,
  StorageModule,
  WXKF_KV_STORAGE,
} from 'server/modules';

import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { QueryHandlers } from './queries';
import { WxkfSagas } from './sagas';
import { WxkfController } from './wxkf.controller';
import { WxkfService, WxkfServiceFactory } from './wxkf.service';

@Module({
  imports: [
    CqrsModule,
    EventStoreModule,
    ConfigModule,
    StorageModule.register(),
  ],
  controllers: [WxkfController],
  providers: [
    {
      provide: WxkfService,
      inject: [ConfigService, MinioService, PrismaService, WXKF_KV_STORAGE],
      useFactory: (
        config: ConfigService,
        minio: MinioService,
        prisma: PrismaService,
        kvStorage: KeyValueStorageBase,
      ) => WxkfServiceFactory(config, minio, prisma, kvStorage),
    },
    WxkfSagas,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
  exports: [WxkfService],
})
export class WxkfModule {}
