// import { Logger } from '@nestjs/common';
// import { plainToClass } from 'class-transformer';
// import { of, EMPTY, Observable, Subject, Subscriber } from 'rxjs';
// import * as Ops from 'rxjs/operators';

// import { WechatService, WxIncomingMessage, WxMessagePayload } from 'src/wechat';

// import { ChatRoute, RouteMessage, RouteMessageType, TextMessageContent, TextWithButtonsMessageContent, Button, ImageMessageContent } from 'src/route';
// import { WxMessageType } from './wechat.dto';

// interface RecipientInfo {
//   appNamespace: string;
//   openid: string;
// }

// const DELIMITER = '::';

// export class WechatChatRoute implements ChatRoute {
//   private readonly logger = new Logger(WechatChatRoute.name);
//   private messageSubject: Subject<WxIncomingMessage>;

//   constructor(private readonly wechatService: WechatService, private readonly name: string) {
//     this.messageSubject = this.wechatService.getSubject(name);
//   }

//   start(): void {
//     // doesn't need to do anything
//     this.logger.debug('wechat chatbot started');
//   }

//   getRouteMessageObservable(): Observable<RouteMessage> {
//     return this.messageSubject.pipe(
//       Ops.concatMap((message: WxIncomingMessage) => {
//         // TODO: set up message type / event type conversion

//         let payload: RouteMessage;

//         if (message.MsgType === 'miniprogrampage' || message.MsgType === 'event') {
//           // fake /greet
//           payload = plainToClass(RouteMessage, {
//             type: RouteMessageType.Wechaty,
//             routeName: this.name,
//             username: this.getUsernameFromMessage(message),
//             content: {
//               type: 'text',
//               text: '/greet',
//             },
//           });
//         }

//         if (message.MsgType === 'text') {
//           payload = plainToClass(RouteMessage, {
//             type: RouteMessageType.Wechaty,
//             routeName: this.name,
//             username: this.getUsernameFromMessage(message),
//             content: {
//               type: 'text',
//               text: message.Content!,
//             },
//           });
//         }

//         this.logger.debug(payload);

//         if (!payload) {
//           return EMPTY;
//         }

//         return of(payload);
//       }),
//     );
//   }

//   routeMessageSubscriber(): Subscriber<RouteMessage> {
//     return Subscriber.create<RouteMessage>(async (message: RouteMessage) => {
//       // TODO: something is not right here
//       const { appNamespace, openid } = this.getRecipientInfoFromResponse(message);

//       this.logger.debug(`${appNamespace} ${openid}`);

//       if (message.content instanceof TextMessageContent) {
//         let finalText = message.content.text;

//         if (message.content instanceof TextWithButtonsMessageContent) {
//           // <a href="weixin://bizmsgmenu?msgmenuid=101&msgmenucontent=yes">满意</a>
//           message.content.buttons.forEach((button: Button, idx: number) => {
//             finalText += `\n\n<a href="weixin://bizmsgmenu?msgmenuid=${idx}&msgmenucontent=${button.payload}">${button.title}</a>`;
//           });
//         }

//         this.logger.debug(finalText);

//         return this.wechatService.sendMessage(
//           appNamespace,
//           plainToClass(WxMessagePayload, {
//             touser: openid,
//             msgtype: WxMessageType.Text,
//             text: {
//               content: finalText,
//             },
//           }),
//         );
//       }

//       if (message.content instanceof ImageMessageContent) {
//         const media_id = await this.wechatService.uploadImage(appNamespace, message.content.image);

//         return this.wechatService.sendMessage(
//           appNamespace,
//           plainToClass(WxMessagePayload, {
//             touser: openid,
//             msgtype: WxMessageType.Image,
//             image: {
//               media_id,
//             },
//           }),
//         );
//       }
//     });
//   }

//   private getUsernameFromMessage(message: WxIncomingMessage) {
//     return `${message.appNamespace}${DELIMITER}${message.FromUserName}`;
//   }

//   private getRecipientInfoFromResponse(payload: RouteMessage): RecipientInfo {
//     const [appNamespace, openid] = payload.username.split(DELIMITER);

//     return {
//       appNamespace,
//       openid,
//     };
//   }
// }
