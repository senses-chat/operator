import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { plainToInstance } from '@senses-chat/operator-common';

import { WechatService } from './wechat.service';
import { Wechat3rdPartyService } from './3rdparty.service';
import { NewWechatMessageCommand } from './commands/new-msg.command';
import { WechatServiceRegistry } from './wechat.registry';

@Controller('wechat')
export class WechatController {
  private readonly logger = new Logger(WechatController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly wechatServiceRegistry: WechatServiceRegistry,
    private readonly wx3pService: Wechat3rdPartyService,
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
  ): Promise<string> {
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

    return 'success';
  }

  @Post('3rdparty/webhook')
  async thirdPartyWebhook(@Body('xml') body: any): Promise<string> {
    let payload = body;

    if (payload.Encrypt) {
      this.logger.debug('incoming message encrypted, decrypting');
      payload = await this.wx3pService.decodeEncryptedXmlMessage(body.Encrypt);
    }

    this.logger.log(payload);
    // TODO: push payload into command bus after digesting the channel

    if (payload.InfoType === 'component_verify_ticket') {
      this.logger.debug('storing component verify ticket');
      await this.wx3pService.storeComponentVerifyTicket(
        payload.ComponentVerifyTicket,
      );
    }

    return 'success';
  }

  private async getWechatServiceFromAppNamespace(
    appNamespace: string,
  ): Promise<WechatService> {
    return this.wechatServiceRegistry.getService(appNamespace);
  }
}
