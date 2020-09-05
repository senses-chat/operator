# chat-operator

## Description

`chat-operator` is a server that helps route messages between chat service providers (Slack, Wechat, etc) to Chatbot services (Rasa, Bot Framework, etc) or even to each other.

Demo (Scan QR with Wechat):

![demo](demo.png)

## Support Matrix

Currently support:

- Wechat Public Account / Mini-App Chat
- Wechaty
- Rasa
- Custom built actions in the form of [Sagas](https://github.com/xanthous-tech/chat-operator/blob/61d7065a5218f0b091fa032624014ced30b9b20d/src/route/sagas/ding-dong.sagas.ts)

Planning to support:

- Wechat for Work (Greetings API)
- Slack
- Telegram
- a generic WebSocket service spun up to accept custom website / app chat widgets.
- persistence and horizontal scalability via Redis Streams
- indexing chat sessions in Elasticsearch

## Installation

```bash
docker-compose up -d
sh init_minio.sh
npm install
```

## Configuration

Please copy `example.env` to `.env.development` and fill in the environment variables shown where applicable. Please also see `src/config` and check out any configuration variables you would like to update.

Also please check [the database seeder README](src/seeds/README.md).

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

<!--
## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
-->

## License

[MIT](LICENSE).
