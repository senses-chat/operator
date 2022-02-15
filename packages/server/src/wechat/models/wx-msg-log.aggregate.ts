import { plainToInstance, instanceToPlain } from 'src/utils/transformer';

import { AggregateRootWithId } from 'src/common';
import { Aggregate } from 'src/event-store';

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
