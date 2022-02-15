import { Logger } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'src/utils/transformer';

import { AggregateRootWithId } from 'src/common';
import { Aggregate } from 'src/event-store';

import { NewWxkfMessageCommand, SendWxkfMessageCommand } from '../commands';
import { NewWxkfMessageEvent, SendWxkfMessageEvent } from '../events';

@Aggregate()
export class WxkfMessageLog extends AggregateRootWithId {
  private _logger = new Logger(WxkfMessageLog.name);

  public messages: Array<NewWxkfMessageEvent | SendWxkfMessageEvent> = [];

  public newMessage(command: NewWxkfMessageCommand): void {
    this.apply(plainToInstance(NewWxkfMessageEvent, instanceToPlain(command)));
  }

  public sendMessage(command: SendWxkfMessageCommand): void {
    this.apply(plainToInstance(SendWxkfMessageEvent, instanceToPlain(command)));
  }

  onNewWxkfMessageEvent(event: NewWxkfMessageEvent): void {
    // this._logger.verbose(`onNewWxkfMessageEvent: ${JSON.stringify(event)}`);
    this.messages.push(event);
  }

  onSendWxkfMessageEvent(event: SendWxkfMessageEvent): void {
    // this._logger.verbose(`onSendWxkfMessageEvent: ${JSON.stringify(event)}`);
    this.messages.push(event);
  }
}
