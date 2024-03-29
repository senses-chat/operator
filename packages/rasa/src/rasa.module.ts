import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { StorageModule } from '@senses-chat/operator-database';
import { EventSourcingModule } from '@senses-chat/operator-events';

import rasaConfig from './config';
import { CommandHandlers } from './commands';
import { EventHandlers } from './events';
import { RasaSagas } from './sagas';
import { RasaService } from './rasa.service';
import { RasaController } from './rasa.controller';

@Module({
  imports: [
    CqrsModule,
    EventSourcingModule,
    ConfigModule.forFeature(rasaConfig),
    StorageModule.register(),
    ScheduleModule.forRoot(),
  ],
  controllers: [RasaController],
  providers: [RasaService, RasaSagas, ...CommandHandlers, ...EventHandlers],
  exports: [RasaService],
})
export class RasaModule {}
