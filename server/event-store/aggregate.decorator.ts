/* eslint-disable @typescript-eslint/ban-types */

import { Logger } from '@nestjs/common';

const logger = new Logger('AggregateRegistry');

export const AggregateStore = new Map<string, Function>();

export const Aggregate = (name?: string): ClassDecorator => {
  return (target: Function) => {
    const aggregateName = name || target.name;
    logger.log(`registering aggregate ${aggregateName}`);
    AggregateStore.set(aggregateName, target);
  };
};
