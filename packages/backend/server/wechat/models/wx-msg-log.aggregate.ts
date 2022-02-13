import { plainToInstance, instanceToPlain } from 'server/utils/transformer';

import { AggregateRootWithId } from 'server/common';
import { Aggregate } from 'server/event-store';

import { NewWechatMessageCommand, SendWechatMessageCommand } from '../commands';
import { NewWechatMessageEvent, SendWechatMessageEvent } from '../events';

@Aggregate()
export class WechatMessageLog extends AggregateRootWithId {
  public newMessage(command: NewWechatMessageCommand): void {
    this.apply(
      plainToInstance(NewWechatMessageEvent, instanceToPlain(command)),
    );
  }

  public sendMessage(command: SendWechatMessageCommand): void {
    this.apply(
      plainToInstance(SendWechatMessageEvent, instanceToPlain(command)),
    );
  }
}
