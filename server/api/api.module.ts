import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreModule } from 'server/event-store';
import { ConfigModule, StorageModule } from 'server/modules';
import { MinioModule } from 'server/modules/storage/minio';
import { PrismaModule } from 'server/modules/storage/prisma';


import { WxkfController } from './wxkf.controller';
import { WxkfService } from '../wxkf/wxkf.service';

@Module({
  imports: [CqrsModule, EventStoreModule, ConfigModule, MinioModule, PrismaModule, StorageModule.register()],
  controllers: [WxkfController],
  providers: [WxkfService],
})
export class ApiModule {}
