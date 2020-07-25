# chat-operator

## Description

`chat-operator` is a server that helps route messages between chat service providers (Slack, Wechat, etc) to Chatbot services (Rasa, Bot Framework, etc) or even to each other.

## Support Matrix

Currently support:

- Wechat Public Account / Mini-App Chat
- Rasa

Planning to support:

- Wechaty
- Slack
- Telegram

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

  [MIT](LICENSE).
