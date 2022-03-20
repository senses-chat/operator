import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Logger,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FastifyReply } from 'fastify';

import { plainToInstance } from '@senses-chat/operator-common';

import { WechatService } from './wechat.service';
import { NewWechatMessageCommand } from './commands/new-msg.command';
import { WechatServiceRegistry } from './wechat.registry';

@Controller('wechat')
export class WechatController {
  private readonly logger = new Logger(WechatController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly wechatServiceRegistry: WechatServiceRegistry,
  ) {}

  @Get('/:appNamespace')
  async validate(
    @Param('appNamespace') appNamespace: string,
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
  ): Promise<string> {
    const wechatService = await this.getWechatServiceFromAppNamespace(appNamespace);

    // https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html
    // 若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，成为开发者成功，否则接入失败
    const validated = await wechatService.validateWechatRequestSignature(
      appNamespace,
      signature,
      timestamp,
      nonce,
    );

    if (!validated) {
      throw new NotFoundException();
    }

    return echostr;
  }

  @Post('/:appNamespace')
  async getMessage(
    @Param('appNamespace') appNamespace: string,
    @Body('xml') body: any,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const wechatService = await this.getWechatServiceFromAppNamespace(appNamespace);

    let payload = body;

    if (payload.Encrypt) {
      this.logger.debug('incoming message encrypted, decrypting');
      payload = await wechatService.decryptXmlMessage(
        body.Encrypt,
      );
    }

    this.logger.log(payload);
    this.commandBus.execute(
      plainToInstance(NewWechatMessageCommand, { ...payload, appNamespace }),
    );

    res.status(200).send('success');
  }

  private async getWechatServiceFromAppNamespace(
    appNamespace: string,
  ): Promise<WechatService> {
    return this.wechatServiceRegistry.getService(appNamespace);
  }
}
