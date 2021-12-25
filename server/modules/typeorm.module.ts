import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'nestjs-config';
import { DynamicModule } from '@nestjs/common';

import { Module as ConfigModule } from './config.module';

export const Module: DynamicModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => configService.get('typeorm'),
  inject: [ConfigService],
});
