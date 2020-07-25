FROM node:10-jessie

EXPOSE 3000

RUN groupadd -r app && useradd -r -g app app
RUN mkdir -p /home/app && chown app:app /home/app
RUN mkdir -p /opt/server && chown -R app:app /opt/server

USER app

WORKDIR /opt/server

ADD ./package.json /opt/server
ADD ./yarn.lock /opt/server
RUN yarn

ADD . /opt/server
RUN yarn build

CMD ["npm", "run", "start:prod"]