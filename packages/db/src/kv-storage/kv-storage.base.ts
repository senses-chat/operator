import { IKeyValueStorage } from './kv-storage.interface';

export abstract class KeyValueStorageBase implements IKeyValueStorage {
  protected _namespace: string | undefined;

  constructor(namespace?: string) {
    this._namespace = namespace;
  }

  get namespace(): string {
    return this._namespace;
  }

  set namespace(value: string) {
    this._namespace = value;
  }

  abstract get(key: string): Promise<string | undefined>;
  abstract set(key: string, value: string, expires?: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
}
