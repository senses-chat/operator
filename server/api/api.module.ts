import { Module } from '@nestjs/common';

import { WxkfModule } from 'server/wxkf';

import { WxkfApiController } from './wxkf-api.controller';

@Module({
  imports: [WxkfModule],
  controllers: [WxkfApiController],
})
export class ApiModule {}
