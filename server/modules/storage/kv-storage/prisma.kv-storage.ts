import { addSeconds } from "date-fns";

import { PrismaService } from "../prisma";
import { KeyValueStorageBase } from "./kv-storage.base";


export class PrismaKeyValueStorage extends KeyValueStorageBase {
  constructor(private readonly prisma: PrismaService, namespace?: string) {
    super(namespace);
  }

  async get(key: string): Promise<string | undefined> {
    const record = await this.prisma.keyValueStorage.findFirst({
      where: {
        namespace: this.namespace,
        key,
      },
    });

    if (!record) {
      return undefined;
    }

    if (record.expires && addSeconds(record.createdAt, record.expires) < new Date()) {
      await this.delete(key);
      return undefined;
    }

    return record.value;
  }

  async set(key: string, value: string, expires?: number): Promise<void> {
    await this.prisma.keyValueStorage.upsert({
      where: {
        namespace_key: {
          namespace: this.namespace,
          key,
        },
      },
      create: {
        namespace: this.namespace,
        key,
        value,
        expires,
      },
      update: {
        value,
        expires,
      },
    });
  }

  async delete(key: string): Promise<void> {
    await this.prisma.keyValueStorage.delete({
      where: {
        namespace_key: {
          namespace: this.namespace,
          key,
        },
      },
    });
  }

  async clear(): Promise<void> {
    await this.prisma.keyValueStorage.deleteMany({
      where: {
        namespace: this.namespace,
      },
    });
  }
}
