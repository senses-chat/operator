import { Type } from '@senses-chat/operator-common';
import { RouteType } from '@senses-chat/operator-database';

export enum MessageContentType {
  Text = 'text',
  TextWithButtons = 'text_with_buttons',
  Image = 'image',
  File = 'file',
}

export class MessageContent {
  type: MessageContentType;
  metadata?: {
    [key: string]: any;
  };
}

export class Button {
  payload: string;
  title: string;
}

export class TextMessageContent extends MessageContent {
  text: string;
}

export class ImageMessageContent extends MessageContent {
  image_url: string;
}

export class TextWithButtonsMessageContent extends TextMessageContent {
  @Type(() => Button)
  buttons: Button[];

  textAfterButtons?: string;
}

export class FileMessageContent extends MessageContent {
  file_url: string;
}

export class RouteMessage {
  type: RouteType;
  namespaces: string[];

  @Type(() => MessageContent, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { value: TextMessageContent, name: MessageContentType.Text },
        {
          value: TextWithButtonsMessageContent,
          name: MessageContentType.TextWithButtons,
        },
        { value: ImageMessageContent, name: MessageContentType.Image },
        { value: FileMessageContent, name: MessageContentType.File },
      ],
    },
  })
  content: MessageContent;
}
