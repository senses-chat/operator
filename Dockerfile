FROM node:16

EXPOSE 3000

WORKDIR /opt/server

ADD ./package.json /opt/server
ADD ./yarn.lock /opt/server
RUN yarn install --frozen-lockfile

ADD . /opt/server
ENV NODE_ENV production
RUN yarn build:prod

CMD ["npm", "run", "start:prod"]