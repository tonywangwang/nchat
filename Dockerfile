FROM docker.neg/base/nodejs:10.7.0-alpine

COPY nchat /nchat

COPY Shanghai /etc/localtime

WORKDIR /nchat

CMD ["node", "index"]

EXPOSE 80