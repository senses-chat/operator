import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { TextMessageContent, TextWithButtonsMessageContent, Button, ImageMessageContent, MessageContentType } from 'server/route';

import { WxkfService } from '../../wxkf.service';
import { SendWxkfMessageEvent } from '../send-msg.event';
import { WxkfMessagePayload, WxkfMessageType } from '../../models';

@EventsHandler(SendWxkfMessageEvent)
export class SendWxkfMessageEventHandler implements IEventHandler<SendWxkfMessageEvent> {
  private readonly logger = new Logger(SendWxkfMessageEventHandler.name);

  constructor(private readonly wxkfService: WxkfService) {}

  public async handle(event: SendWxkfMessageEvent): Promise<void> {
    this.logger.verbose(`send wxkf message event: ${JSON.stringify(event)}`);

    const { message } = event;
    const { content } = message;

    let payload: any = {};

    if (content.metadata && content.metadata.welcome_code) {
      payload = {
        code: content.metadata.welcome_code,
      };
    } else {
      const [open_kfid, touser] = message.namespaces;
      payload = {
        touser,
        open_kfid,
      };
    }

    this.logger.debug(JSON.stringify(payload));

    if (message.content.type === MessageContentType.Text) {
      return this.wxkfService.sendMessage(
        plainToInstance(WxkfMessagePayload, {
          ...payload,
          msgtype: WxkfMessageType.Text,
          text: {
            content: (content as TextMessageContent).text,
          },
        }),
      );
    }

    // if (message.content instanceof ImageMessageContent) {
    //   const media_id = await this.wxkfService.uploadImage(appNamespace, message.content.image);

    //   return this.wxkfService.sendMessage(
    //     appNamespace,
    //     plainToInstance(WxkfMessagePayload, {
    //       touser: openid,
    //       msgtype: WxkfMessageType.Image,
    //       image: {
    //         media_id,
    //       },
    //     }),
    //   );
    // }
  }
}
