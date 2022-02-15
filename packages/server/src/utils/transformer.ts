import {
  Type,
  ClassConstructor,
  plainToInstance as p2i,
  instanceToPlain as i2p,
} from 'class-transformer';

export { Type };

export function plainToInstance<T, V>(cls: ClassConstructor<T>, plain: V): T;
export function plainToInstance<T, V>(
  cls: ClassConstructor<T>,
  plain: V[],
): T[] {
  return p2i(cls, plain);
}

export function instanceToPlain<T>(object: T): Record<string, any>;
export function instanceToPlain<T>(object: T[]): Record<string, any>[] {
  // @ts-ignore
  return i2p(object, {
    exposeUnsetFields: false,
    excludePrefixes: ['_'],
  });
}
