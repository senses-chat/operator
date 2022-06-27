import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import {
  TextMessageContent,
  TextWithButtonsMessageContent,
  Button,
  ImageMessageContent,
  MessageContentType,
} from '@senses-chat/operator-events';
import { plainToInstance } from '@senses-chat/operator-common';
import {
  WxkfMenuType,
  WxkfMessagePayload,
  WxkfMessageType,
} from '@senses-chat/wx-sdk';

import { WxkfServiceRegistry } from '../../wxkf.registry';
import { SendWxkfMessageEvent } from '../send-msg.event';

@EventsHandler(SendWxkfMessageEvent)
export class SendWxkfMessageEventHandler
  implements IEventHandler<SendWxkfMessageEvent>
{
  private readonly logger = new Logger(SendWxkfMessageEventHandler.name);

  constructor(private readonly wxkfServiceRegistry: WxkfServiceRegistry) {}

  public async handle(event: SendWxkfMessageEvent): Promise<void> {
    this.logger.verbose(`send wxkf message event: ${JSON.stringify(event)}`);

    const { message } = event;
    const { content } = message;

    let payload: any = {};

    if (content.metadata && content.metadata.msg_code) {
      payload = {
        corpid: message.namespaces[0],
        code: content.metadata.msg_code,
      };
    } else {
      const [corpid, open_kfid, touser] = message.namespaces;
      payload = {
        corpid,
        touser,
        open_kfid,
      };
    }

    this.logger.debug(JSON.stringify(payload));

    const wxkfService = await this.wxkfServiceRegistry.getService(payload.corpid);

    if (content.type === MessageContentType.Text) {
      const textMessageContent = content as TextMessageContent;
      if (textMessageContent.text) {
        await wxkfService.sendMessage(
          plainToInstance(WxkfMessagePayload, {
            ...payload,
            msgtype: WxkfMessageType.Text,
            text: {
              content: textMessageContent.text,
            },
          }),
        );
      }
    }

    if (content.type === MessageContentType.TextWithButtons) {
      const textWithButtonsContent = content as TextWithButtonsMessageContent;
      await wxkfService.sendMessage(
        plainToInstance(WxkfMessagePayload, {
          ...payload,
          msgtype: WxkfMessageType.Menu,
          msgmenu: {
            head_content: textWithButtonsContent.text,
            tail_content: textWithButtonsContent.textAfterButtons,
            list: textWithButtonsContent.buttons.map((button: Button) => ({
              // TODO: make more different types than click
              type: WxkfMenuType.Click,
              click: {
                id: button.payload,
                content: button.title,
              },
            })),
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

    if (content.metadata && content.metadata.service_state) {
      await wxkfService.transferServiceState(
        payload.open_kfid,
        payload.touser,
        content.metadata.service_state,
        content.metadata.servicer_userid,
      )
    }
  }
}
