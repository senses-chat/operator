export interface IKeyValueStorage {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string, expires?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
