FROM node:20.5-alpine

WORKDIR /app

COPY . ./

# Устанавливаем зависимости
RUN npm install

EXPOSE 3000

CMD ["/bin/sh", "-c", "npm run migration:run && npm run start:dev"]