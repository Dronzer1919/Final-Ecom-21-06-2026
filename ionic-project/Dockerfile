FROM node:20-alpine AS build

WORKDIR /app

COPY ionic-project/package*.json ./
RUN npm ci

COPY ionic-project/ ./
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine

COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/www /usr/share/nginx/html

EXPOSE 80
