import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { TextMessageContent, TextWithButtonsMessageContent, Button, ImageMessageContent, MessageContentType } from 'server/route';

import { WecomService } from '../../wecom.service';
import { SendWecomMessageEvent } from '../send-msg.event';
import { WecomMessagePayload, WecomMessageType } from '../../models';

@EventsHandler(SendWecomMessageEvent)
export class SendWecomMessageEventHandler implements IEventHandler<SendWecomMessageEvent> {
  private readonly logger = new Logger(SendWecomMessageEventHandler.name);

  constructor(private readonly wecomService: WecomService) {}

  public async handle(event: SendWecomMessageEvent): Promise<void> {
    this.logger.verbose(`send wecom message event: ${JSON.stringify(event)}`);

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
      return this.wecomService.sendMessage(
        plainToInstance(WecomMessagePayload, {
          ...payload,
          msgtype: WecomMessageType.Text,
          text: {
            content: (content as TextMessageContent).text,
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
