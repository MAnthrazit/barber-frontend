# Angular
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli && npm install
COPY . .

RUN npm run build

# Ngnix
FROM nginx:latest
COPY --from=build /app/dist/barber-frontend/browser/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL
RUN apk add --no-cache certbot certbot-nginx bash curl crond
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY crontab.txt /etc/crontabs/root

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]

