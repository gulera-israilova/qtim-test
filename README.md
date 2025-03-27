# Запуск приложения

## Запуск с помощью Docker

Для запуска приложения с использованием Docker выполните следующую команду:

```bash
docker compose -f docker-compose.yaml up -d --build --force-recreate --remove-orphans
```

## Локальный запуск

Для локальной разработки выполните следующие шаги:
1.	Установите зависимости:
  ```bash
  npm install
  ```
2.	Выполните миграции:
   ```bash
  npm run migration:run
   ```
3.	Запустите приложение в режиме разработки:
   ```bash
  npm run start:dev
  ```

Создайте файл .env на основе примера .env.example

Данные пользователя по умолчанию:
- Логин: user
- Пароль: user
