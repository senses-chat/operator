import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import prismaConfig from './config';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forFeature(prismaConfig)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
