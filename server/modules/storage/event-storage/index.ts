export * from './event-storage.interface';
export * from './redis.event-storage';
export * from './prisma.event-stroage';

export const EVENT_STORAGE = Symbol.for('EventStorage');
