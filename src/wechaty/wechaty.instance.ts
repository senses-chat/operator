import { Logger } from '@nestjs/common';
import { Wechaty, Message, ScanStatus, Contact } from 'wechaty';
import { Puppet } from 'wechaty-puppet';
import PuppetHostie from 'wechaty-puppet-hostie';

import { WorkerDataPayload, EventPayload } from './models/wechaty.dto';
import { Subject, Subscription } from 'rxjs';

const QR_URL = `https://wechaty.github.io/qrcode`;

export class WechatyInstance {
  private logger: Logger;
  private wechaty: Wechaty;
  public msgSubject: Subject<Message>;
  public evtSubject: Subject<EventPayload>;
  public subscription: Subscription;

  constructor(private readonly workerData: WorkerDataPayload) {
    this.logger = new Logger(`Wechaty-${this.workerData.name}`);
    this.msgSubject = new Subject<Message>();
    this.evtSubject = new Subject<EventPayload>();
    this.setUpBot();
  }

  public start(): void {
    if (!this.wechaty) {
      return;
    }

    this.logger.debug('starting wechaty');
    this.wechaty.start();
  }

  private setUpBot(): void {
    this.logger.debug('setting up wechaty');

    this.wechaty = new Wechaty({
      puppet: this.getPuppet(this.workerData),
    });

    this.wechaty.on('scan', (qrcode: string, status: ScanStatus) => {
      const evt: EventPayload = {
        eventName: 'scan',
        payload: {
          qrcode,
          status,
        },
      };

      this.evtSubject.next(evt);

      if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        this.logger.log(`Please open this link and scan QR code with Wechat: ${QR_URL}/${encodeURIComponent(qrcode)}`);
      }
    });

    this.wechaty.on('login', (user: Contact) => {
      this.logger.debug(`login - ${JSON.stringify(user)}`);
    });

    this.wechaty.on('logout', (user: Contact) => {
      this.logger.debug(`logout - ${JSON.stringify(user)}`);
    });

    this.wechaty.on('message', (message: Message) => {
      this.logger.debug(`message - ${JSON.stringify(message)}`);
      this.msgSubject.next(message);
    });
  }

  private getPuppet({ puppet, token }: WorkerDataPayload): Puppet {
    switch (puppet) {
      case 'wechaty-puppet-hostie':
        return new PuppetHostie({
          token,
        });
      default:
        throw new Error(`puppet ${puppet} not supported`);
    }
  }
}
