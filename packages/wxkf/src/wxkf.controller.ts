import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Logger,
  NotFoundException,
  HttpCode,
  Param,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { plainToInstance } from '@senses-chat/operator-common';

import { NewWxkfMessageCommand } from './commands/new-msg.command';
import { WxkfServiceRegistry } from './wxkf.registry';

@Controller('wxkf')
export class WxkfController {
  private readonly logger = new Logger(WxkfController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly wxkfServiceRegistry: WxkfServiceRegistry,
  ) {}

  @Get()
  async validate(
    @Param('corpId') corpId: string,
    @Query('msg_signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
  ): Promise<string> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);

    // https://open.work.weixin.qq.com/api/doc/90000/90135/90930
    // 根据已有的token，结合第1步获取的参数timestamp, nonce, echostr重新计算签名，然后与参数msg_signature检查是否一致，确认调用者的合法性。
    const validated = await wxkfService.validateWxkfRequestSignature(
      signature,
      timestamp,
      nonce,
      echostr,
    );

    if (!validated) {
      throw new NotFoundException();
    }

    // 解密echostr参数得到消息内容（即msg字段）
    // 在1秒内响应GET请求，响应内容为上一步得到的明文消息内容（不能加引号，不能带bom头，不能带换行符）
    return Promise.resolve(wxkfService.decryptMessage(echostr));
  }

  @Post()
  @HttpCode(200)
  async getMessage(
    @Param('corpId') corpId: string,
    @Query('msg_signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Body('xml') body: any,
  ): Promise<string> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);

    const validated = wxkfService.validateWxkfRequestSignature(
      signature,
      timestamp,
      nonce,
      body.Encrypt,
    );

    if (!validated) {
      throw new NotFoundException();
    }

    const tokenMessage = wxkfService.decryptXmlMessage(body.Encrypt);
    const messages = await wxkfService.syncMessage(tokenMessage.Token);

    if (messages.msg_list) {
      messages.msg_list.forEach((message) => {
        const command = plainToInstance(NewWxkfMessageCommand, {
          ...message,
          corpid: corpId,
        });
        this.commandBus.execute(command);
      });
    }

    return 'success';
  }

  @Get('/latest')
  async fetchTillLatestMessage(
    @Param('corpId') corpId: string,
  ): Promise<string> {
    const wxkfService = await this.wxkfServiceRegistry.getService(corpId);
    const messages = await wxkfService.syncMessage();
    return messages.next_cursor;
  }
}
