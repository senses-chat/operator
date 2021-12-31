import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { TextMessageContent, TextWithButtonsMessageContent, Button, ImageMessageContent } from 'server/route';

import { WecomService } from '../../wecom.service';
import { SendWecomMessageEvent } from '../send-msg.event';
import { WecomMessagePayload, WecomMessageType } from '../../models';

@EventsHandler(SendWecomMessageEvent)
export class SendWecomMessageEventHandler implements IEventHandler<SendWecomMessageEvent> {
  private readonly logger = new Logger(SendWecomMessageEventHandler.name);

  constructor(private readonly wecomService: WecomService) {}

  public async handle(event: SendWecomMessageEvent): Promise<void> {
    this.logger.verbose(`send wechat message event: ${JSON.stringify(event)}`);

    const { message } = event;

    let payload: any = {};

    if (message.namespaces.length === 2) {
      const [open_kfid, touser] = message.namespaces;
      payload = {
        touser,
        open_kfid,
      };
    }

    if (message.namespaces.length === 3) {
      const [open_kfid, touser, code] = message.namespaces;
      payload = {
        code,
      };
    }


    this.logger.debug(JSON.stringify(payload));

    if (message.content instanceof TextMessageContent) {
      return this.wecomService.sendMessage(
        plainToInstance(WecomMessagePayload, {
          ...payload,
          msgtype: WecomMessageType.Text,
          text: {
            content: message.content.text,
          },
        }),
      );
    }

    // if (message.content instanceof ImageMessageContent) {
    //   const media_id = await this.wecomService.uploadImage(appNamespace, message.content.image);

    //   return this.wecomService.sendMessage(
    //     appNamespace,
    //     plainToInstance(WecomMessagePayload, {
    //       touser: openid,
    //       msgtype: WecomMessageType.Image,
    //       image: {
    //         media_id,
    //       },
    //     }),
    //   );
    // }
  }
}
