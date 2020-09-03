import { Observable, Subscriber } from 'rxjs';
import { Type } from 'class-transformer';

export enum RouteType {
  Rasa = 'Rasa',
  WechatApp = 'WechatApp',
  Wechaty = 'Wechaty',
}

export enum MessageContentType {
  Text = 'text',
  TextWithButtons = 'text_with_buttons',
  Image = 'image',
}

export class MessageContent {
  type: MessageContentType;
}

export class Button {
  payload: string;
  title: string;
}

export class TextMessageContent extends MessageContent {
  text: string;
}

export class ImageMessageContent extends MessageContent {
  image: string;
}

export class TextWithButtonsMessageContent extends TextMessageContent {
  @Type(() => Button)
  buttons: Button[];
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
        { value: TextWithButtonsMessageContent, name: MessageContentType.TextWithButtons },
        { value: ImageMessageContent, name: MessageContentType.Image },
      ],
    },
  })
  content: MessageContent;
}

export interface ChatRoute {
  start(): void;
  getRouteMessageObservable(): Observable<RouteMessage>;
  routeMessageSubscriber(): Subscriber<RouteMessage>;
}
