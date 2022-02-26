# 先思智联Senses Chat Operator

## 介绍

先思智联是一个聊天机器人消息中间件服务器，用于集中接收不同客服渠道的消息（微信客服、字节跳动客服渠道等），并转发到对应聊天机器人框架（Rasa，Bot Framework 等），实现比官方提供的自动回复更加灵活的消息处理和聚合。

Demo (微信扫描二维码):

![demo](demo.png)

## 支持列表

目前支持对接以下客服渠道:

- [微信客服](https://work.weixin.qq.com/kf)
  - 微信公众号客服
  - 微信小程序客服
  - 微信视频号客服
- 原微信公众号和小程序客服渠道

目前支持对接以下聊天机器人框架：

- [Rasa](https://rasa.com)
- 自定义HTTP服务

后续支持对接以下服务/聊天机器人框架或协议:

- 企业微信
- 字节跳动系客服通道
- Bilibili
- WebSocket 通道（SocketIO）
- Microsoft BotFramework

目前所有收发的消息均可在 Redis Stream 或者 SQL（通过 Prisma）中存储。

## 文档

TODO，不过如果有任何疑问，可以随时扫上面的二维码然后通过人工客服联系我。

## License

[MIT](LICENSE).
