FROM node:16-alpine AS builder

WORKDIR /opt/src

ADD ./package.json /opt/src
ADD ./yarn.lock /opt/src
RUN yarn install --frozen-lockfile

ADD . /opt/src
ENV NODE_ENV production
RUN yarn build:prod

FROM node:16-alpine as runner

EXPOSE 3000

WORKDIR /opt/server

RUN mkdir -p /opt/server/node_modules

COPY --from=builder /opt/src/dist ./dist
COPY --from=builder /opt/src/.next ./.next
COPY --from=builder /opt/src/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /opt/src/package.json ./package.json
COPY --from=builder /opt/src/yarn.lock ./yarn.lock

# this prevents installing devDependencies
ENV NODE_ENV production
RUN yarn install --frozen-lockfile

CMD ["npm", "run", "start:prod"]
