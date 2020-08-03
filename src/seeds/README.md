# Seed Instructions

Please follow the following example to create seed data:

## Wechat Apps

```typescript
// 001-wechat-app.ts

import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import { WechatApp } from '../wechat/wechat.entity';

export default class CreateWechatApps implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(WechatApp)
      .values([
        {
          name: 'wechat_app_name',
          appId: '<appId>',
          appSecret: '<appSecret>',
          token: '<token>',
          aesKey: '<aesKey>',
        },
      ])
      .execute();
  }
}
```

## Rasa Servers

```typescript
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import { RasaServer } from '../rasa/rasa.entity';

export default class CreateWechatApps implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(RasaServer)
      .values([
        {
          name: 'xtech-welcome-bot',
          isActive: true,
          port: 5006,
          dockerOptions: {
            name: 'xtech-welcome-bot',
            Image: 'xtech-welcome-bot:latest',
            Hostname: `rasa-xtech-welcome-bot`,
            Cmd: [
              'run',
              '-m',
              '20200401-102644.tar.gz',
              '--endpoints',
              'endpoints.yml',
              '--remote-storage',
              'aws',
              '--enable-api',
              '--debug',
            ],
            Env: [
              'AWS_ACCESS_KEY_ID=minio',
              'AWS_SECRET_ACCESS_KEY=minio123',
              'AWS_DEFAULT_REGION=minio-default',
              'AWS_ENDPOINT_URL=http://minio:9000',
              'TRACKER_STORE_HOST=postgres',
              'TRACKER_STORE_PORT=5432',
              'TRACKER_STORE_DB=visa-bot',
              'TRACKER_STORE_USERNAME=chatop',
              'TRACKER_STORE_PASSWORD=chatOperator',
              'BUCKET_NAME=models',
            ],
            HostConfig: {
              NetworkMode: 'chat-operator',
              PortBindings: {
                [`5005/tcp`]: [{ HostPort: '5006' }],
              },
            },
          }
        },
      ])
      .execute();
  }
}

```

## Routes

```typescript
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import { Route } from '../route/models/route.entity';
import { RouteType } from '../route/models/route.dto';

export default class CreateRoutes implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Route)
      .values([
        {
          sourceType: RouteType.WechatApp,
          sourceName: 'wechat_app_name',
          destinationType: RouteType.Rasa,
          destinationName: 'xtech-welcome-bot',
          isActive: true,
        },
      ])
      .execute();
  }
}

```