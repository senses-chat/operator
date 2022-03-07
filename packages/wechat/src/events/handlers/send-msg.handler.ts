import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { plainToInstance } from '@senses-chat/operator-common';
import { WechatMessageInput, WechatMessageType } from '@senses-chat/wx-sdk';
import {
  TextMessageContent,
  TextWithButtonsMessageContent,
  Button,
  ImageMessageContent,
} from '@senses-chat/operator-events';

import { SendWechatMessageEvent } from '../send-msg.event';
import { WechatServiceRegistry } from '../../wechat.registry';
import { WechatService } from '../../wechat.service';

@EventsHandler(SendWechatMessageEvent)
export class SendWechatMessageEventHandler
  implements IEventHandler<SendWechatMessageEvent>
{
  private readonly logger = new Logger(SendWechatMessageEventHandler.name);

  constructor(private readonly wechatServiceRegistry: WechatServiceRegistry) {}

  public async handle(event: SendWechatMessageEvent): Promise<void> {
    this.logger.verbose(`send wechat message event: ${JSON.stringify(event)}`);

    const { message } = event;
    const [appNamespace, openid] = message.namespaces;
    const wechatService: WechatService = await this.wechatServiceRegistry.getService(appNamespace);

    this.logger.debug(`${appNamespace} ${openid}`);

    if (message.content instanceof TextMessageContent) {
      let finalText = message.content.text;

      if (message.content instanceof TextWithButtonsMessageContent) {
        // <a href="weixin://bizmsgmenu?msgmenuid=101&msgmenucontent=yes">满意</a>
        message.content.buttons.forEach((button: Button, idx: number) => {
          finalText += `\n\n<a href="weixin://bizmsgmenu?msgmenuid=${idx}&msgmenucontent=${button.payload}">${button.title}</a>`;
        });
      }

      this.logger.debug(finalText);

      return wechatService.sendMessage(
        plainToInstance(WechatMessageInput, {
          touser: openid,
          msgtype: WechatMessageType.Text,
          text: {
            content: finalText,
          },
        }),
      );
    }

    if (message.content instanceof ImageMessageContent) {
      const media_id = await wechatService.uploadImage(
        message.content.image_url,
      );

      return wechatService.sendMessage(
        plainToInstance(WechatMessageInput, {
          touser: openid,
          msgtype: WechatMessageType.Image,
          image: {
            media_id,
          },
        }),
      );
    }
  }
}
