FROM node:18

COPY ./package.json /myProject/
COPY ./yarn.lock /myProject/
WORKDIR /myProject/
RUN yarn install

COPY . /myProject/

CMD yarn start:dev