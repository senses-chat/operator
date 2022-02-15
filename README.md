# chat-operator

## 介绍

`chat-operator` 是一个消息中间件服务器，用于集中接收不同渠道的消息（微信、企业微信、微信小程序、B 站等），并转发到对应的渠道（Rasa，Bot Framework 等）。

Demo (微信扫描二维码):

![demo](demo.png)

## 支持列表

目前支持以下服务:

- 微信公众号 / 微信小程序客服通道
- 微信客服
- Rasa
- Custom built actions in the form of [Sagas](https://github.com/xanthous-tech/chat-operator/blob/61d7065a5218f0b091fa032624014ced30b9b20d/src/route/sagas/ding-dong.sagas.ts) and/or [XState](https://xstate.js.org)

后续支持对接以下服务:

- 企业微信
- Bilibili
- 字节跳动系客服通道
- WebSocket 通道（SocketIO）
- Microsoft BotFramework

目前所有收发的消息均可在 Redis Stream 或者 SQL（通过 Prisma）中存储。

## 安装

```bash
docker-compose up -d
sh init_minio.sh
npm install
```

## 配置

TODO

## 运行

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## License

[MIT](LICENSE).
