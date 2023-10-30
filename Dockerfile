FROM node:10-alpine as builder
 
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json ./
USER node
 
RUN npm cache clean --force &&  npm install
COPY --chown=node:node . .

RUN npm run build-js
 
FROM httpd:2.4.38
LABEL maintainer=almaviva.it
COPY  --from=builder /home/node/app/build/  /usr/local/apache2/htdocs/
COPY  httpd.conf /usr/local/apache2/conf/
EXPOSE 80
