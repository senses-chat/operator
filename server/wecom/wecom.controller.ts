import { Controller, Get, Post, Body, Query, Logger, NotFoundException, HttpCode } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';

import { NewWecomMessageCommand } from './commands/new-msg.command';
import { WecomService } from './wecom.service';

@Controller('wecom')
export class WecomController {
  private readonly logger = new Logger(WecomController.name);
  constructor(private readonly commandBus: CommandBus, private readonly wecomService: WecomService) {}

  @Get()
  async validate(
    @Query('msg_signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
  ): Promise<string> {
    // https://open.work.weixin.qq.com/api/doc/90000/90135/90930
    // 根据已有的token，结合第1步获取的参数timestamp, nonce, echostr重新计算签名，然后与参数msg_signature检查是否一致，确认调用者的合法性。
    const validated = this.wecomService.validateWecomRequestSignature(signature, timestamp, nonce, echostr);

    if (!validated) {
      throw new NotFoundException();
    }

    // 解密echostr参数得到消息内容（即msg字段）
    // 在1秒内响应GET请求，响应内容为上一步得到的明文消息内容（不能加引号，不能带bom头，不能带换行符）
    return Promise.resolve(this.wecomService.decryptMessage(echostr));
  }

  @Post()
  @HttpCode(200)
  async getMessage(
    @Query('msg_signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Body('xml') body: any,
  ): Promise<string> {
    const validated = this.wecomService.validateWecomRequestSignature(signature, timestamp, nonce, body.Encrypt);

    if (!validated) {
      throw new NotFoundException();
    }

    const tokenMessage = this.wecomService.decryptXmlMessage(body.Encrypt);
    const messages = await this.wecomService.syncMessage(tokenMessage.Token);

    if (messages.msg_list) {
      messages.msg_list.forEach((message) => {
        const command = plainToInstance(NewWecomMessageCommand, message);
        this.commandBus.execute(command);
      });
    }

    return 'success';
  }
}
