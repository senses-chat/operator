FROM node:16-alpine AS builder

WORKDIR /opt/src

ADD . /opt/src

RUN yarn install
RUN yarn build
RUN yarn workspace @senses-chat/operator-server build --webpack

FROM node:16-alpine AS runner

EXPOSE 3001

WORKDIR /opt/server

COPY --from=builder /opt/src/packages/server/dist/main.* /opt/server

RUN mkdir -p /opt/server/node_modules

COPY --from=builder /opt/src/node_modules/.prisma /opt/server/node_modules

RUN mkdir -p /opt/server/node_modules/@prisma

COPY --from=builder /opt/src/node_modules/@prisma/client /opt/server/node_modules/@prisma

CMD ["node", "main.js"]
