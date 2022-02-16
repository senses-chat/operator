/* eslint-disable @typescript-eslint/ban-types */
import { Logger } from '@nestjs/common';

const logger = new Logger('EventRegistry');

export const EventMetadataStore = new Map<string, Function>();

export const Event = (): ClassDecorator => {
  return (target: Function) => {
    logger.log(`registering event ${target.name}`);
    EventMetadataStore.set(target.name, target);
  };
};
