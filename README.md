# MotorTen API

**Тема курсовой работы:** Разработка REST API для системы управления каталогом автомобильных товаров MotorTen.

MotorTen API — учебное серверное приложение для хранения каталога автотоваров, категорий, пользователей и отзывов. Приложение предоставляет REST API с JSON-ответами, использует PostgreSQL, Prisma ORM, JWT-аутентификацию и разграничение прав между обычным пользователем и администратором.

> **Статус:** учебный проект. Примеры ниже основаны на реализованных в ходе работы маршрутах. Перед публикацией на GitHub необходимо повторить тесты и сверить примеры с текущим исходным кодом. Дата составления документации: 25.11.2026.

## 1. Технологии

- **Node.js** — среда выполнения JavaScript (проект использует ES Modules).
- **Express.js** — HTTP-сервер и маршрутизация.
- **PostgreSQL** — реляционная база данных.
- **Prisma ORM** и **@prisma/adapter-pg** — работа с БД.
- **Argon2id** — хеширование паролей.
- **jsonwebtoken (JWT)** — токены доступа.
- **Zod** — проверка входных данных.
- **dotenv** — переменные окружения.

## 2. Функции

- Регистрация пользователей с ролью `user` по умолчанию.
- Вход по email и паролю с выдачей JWT access token.
- Проверка JWT и ролей `user` / `admin` на сервере.
- Публичное чтение категорий и каталога товаров.
- Полный CRUD для товаров: создавать, изменять и удалять их может только администратор.
- Просмотр отзывов, создание отзыва авторизованным пользователем, изменение собственного отзыва, удаление отзыва владельцем или администратором.
- Валидация данных, JSON-ответы, обработка ошибок и HTTP-статусы.

## 3. Структура проекта

```text
motorten-api/
├── docs/
│   └── erd.png
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   └── reviewRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── categoryService.js
│   │   ├── productService.js
│   │   └── reviewService.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma7.config.ts
└── README.md
```

Слои приложения: **HTTP → Route → Controller → Service → Prisma Client → PostgreSQL**. Проверка JWT выполняется в middleware, а не дублируется внутри каждого маршрута.

## 4. Установка и запуск на Windows

### Требования

- Node.js с npm (в разработке использовался Node.js 24).
- Локально установленный PostgreSQL (в разработке использовался PostgreSQL 17).
- Любой терминал: PowerShell, терминал VS Code.
- pgAdmin 4 — необязательно, но удобно для просмотра базы.

### 4.1. Получение проекта

Склонируйте **свой** репозиторий (URL добавляется после публикации), либо откройте папку `motorten-api` в VS Code. В каталоге проекта установите зависимости:

```powershell
npm.cmd install
```

### 4.2. Создание базы данных

В PostgreSQL создайте пустую базу **`motorten_db`**. Через pgAdmin 4: `Servers → PostgreSQL → Databases → Create → Database`, имя `motorten_db`.

### 4.3. Настройка окружения

Создайте файл `.env` на основе `.env.example`, подставив **собственный** пароль PostgreSQL и случайный `JWT_SECRET`. Пример структуры:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/motorten_db?schema=public"
JWT_SECRET="REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS"
PORT=3000
```

Пароль в `DATABASE_URL` необходимо URL-кодировать, если он содержит спецсимволы. **Не добавляйте `.env`, реальные пароли или JWT в GitHub.** Файл `.env.example` хранит только образец, без настоящих секретов.

Сгенерировать секрет в PowerShell можно такой командой:

```powershell
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"
```

Убедитесь, что `prisma7.config.ts` загружает переменные окружения:

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

### 4.4. Миграции и генерация клиента

В корне проекта:

```powershell
npx.cmd prisma validate
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

Для локальной **разработки схемы** можно использовать `npx.cmd prisma migrate dev --name имя_миграции`; для развёртывания уже существующих миграций применяется `migrate deploy`.

### 4.5. Запуск сервера

```powershell
npm.cmd run dev
```

Сервер: `http://localhost:3000`.

Проверки:

- `GET http://localhost:3000/` — информация о проекте.
- `GET http://localhost:3000/api/health` — ответ `{ "status": "ok" }`.
- `GET http://localhost:3000/api/categories` — список категорий.
- `GET http://localhost:3000/api/products` — список товаров.

Чтобы запустить без режима наблюдения за файлами, используйте `npm.cmd start`, если команда `start` определена в `package.json`.

### 4.6. Начальные данные

В демонстрационной базе вручную созданы категории: `Автомасла`, `Автозапчасти`, `Шины и диски`, `Автоаксессуары`. Добавить их в новой установке можно через Prisma Studio или собственный seed-скрипт:

```powershell
npx.cmd prisma studio --config ./prisma7.config.ts
```

На тестовой установке присутствовали товары «Моторное масло 5W-30» и «Тормозная жидкость DOT 4». В новой базе эти записи не появятся автоматически без отдельного заполнения.

## 5. Структура базы данных

Четыре основные сущности:

| Сущность | Основные поля | Связи |
|---|---|---|
| `User` | `id` PK, `name`, `email` UNIQUE, `passwordHash`, `role`, `createdAt` | Один пользователь — много отзывов |
| `Category` | `id` PK, `name` UNIQUE | Одна категория — много товаров |
| `Product` | `id` PK, `name`, `description`, `price`, `stock`, `categoryId` FK, `createdAt` | Относится к категории, имеет отзывы |
| `Review` | `id` PK, `rating`, `comment`, `userId` FK, `productId` FK, `createdAt` | Относится к пользователю и товару |

Для `Review` установлено составное уникальное ограничение (`userId`, `productId`): один пользователь может оставить не более одного отзыва на конкретный товар.

![ER-диаграмма MotorTen](docs/erd.png)

> В репозитории должен реально находиться файл `docs/erd.png`. Изображение должно соответствовать текущей `prisma/schema.prisma`.

## 6. Доступ и роли

| Действие | Гость | Пользователь `user` | Администратор `admin` |
|---|:---:|:---:|:---:|
| Просмотр категорий и товаров | Да | Да | Да |
| Регистрация / вход | Да | Да | Да |
| Получение `/api/auth/me` | Нет | Да | Да |
| Создание / изменение / удаление товара | Нет | Нет | Да |
| Просмотр отзывов | Да | Да | Да |
| Создание отзыва | Нет | Да | Да |
| Изменение отзыва | Нет | Только свой | Только свой |
| Удаление отзыва | Нет | Только свой | Свой и чужой |

Публичная регистрация всегда создаёт роль `user`, даже если в теле запроса прислана роль `admin`. Для демонстрации роль тестового администратора назначается **локально через Prisma Studio**, а не через публичный API. Владельцем отзыва считается `req.user.id`, полученный из JWT и проверенный по БД.

## 7. HTTP API

Базовый URL: **`http://localhost:3000`**.

Все запросы с телом используют `Content-Type: application/json`. Для защищённых запросов передавайте `Authorization: Bearer <accessToken>`. Для `GET` и `DELETE` в описанных ниже маршрутах тело запроса не требуется.

### Краткий перечень

| Метод | Endpoint | Доступ | Успех |
|---|---|---|---|
| GET | `/` | Публичный | 200 |
| GET | `/api/health` | Публичный | 200 |
| POST | `/api/auth/register` | Публичный | 201 |
| POST | `/api/auth/login` | Публичный | 200 |
| GET | `/api/auth/me` | JWT | 200 |
| GET | `/api/auth/admin-check` | JWT admin | 200 |
| GET | `/api/categories` | Публичный | 200 |
| GET | `/api/products` | Публичный | 200 |
| GET | `/api/products/:id` | Публичный | 200 |
| POST | `/api/products` | JWT admin | 201 |
| PATCH | `/api/products/:id` | JWT admin | 200 |
| DELETE | `/api/products/:id` | JWT admin | 200 |
| GET | `/api/products/:id/reviews` | Публичный | 200 |
| POST | `/api/products/:id/reviews` | JWT | 201 |
| PATCH | `/api/reviews/:id` | JWT, автор отзыва | 200 |
| DELETE | `/api/reviews/:id` | JWT, автор либо admin | 200 |

`:id` — положительное целое число (идентификатор записи).

### 7.1. GET `/` — сведения о сервере

- **Доступ:** публичный. **Заголовки:** необязательны. **Параметры, тело:** отсутствуют.
- **200 OK:**

```json
{"name":"MotorTen API","version":"1.0.0","message":"Сервер работает успешно!"}
```

### 7.2. GET `/api/health` — состояние сервера

- **Доступ:** публичный. **Заголовки, параметры, тело:** отсутствуют.
- **200 OK:** `{"status":"ok"}`.

### 7.3. POST `/api/auth/register` — регистрация

- **Доступ:** публичный. **Заголовок:** `Content-Type: application/json`. **Параметры URL:** отсутствуют.
- **Тело:** `name` — строка не короче 2 символов, `email` — корректный адрес, `password` — строка не короче 8 символов.

```json
{"name":"Demo User","email":"demo@example.com","password":"ExamplePassword123!"}
```

- **201 Created**, пример ответа:

```json
{"message":"Регистрация успешна","user":{"id":3,"name":"Demo User","email":"demo@example.com","role":"user"}}
```

- **Ошибки:** `400` — некорректные данные; `409` — email занят; `500` — внутренняя ошибка. Поле `passwordHash` в ответ не включается. Переданное клиентом `role` не может дать привилегии `admin`.

### 7.4. POST `/api/auth/login` — вход

- **Доступ:** публичный. **Заголовок:** `Content-Type: application/json`. **Параметры URL:** отсутствуют.
- **Тело:** `email` и `password`.

```json
{"email":"demo@example.com","password":"ExamplePassword123!"}
```

- **200 OK**, пример ответа:

```json
{"user":{"id":3,"name":"Demo User","email":"demo@example.com","role":"user"},"accessToken":"<JWT>"}
```

- **Ошибки:** `400` — некорректный JSON или поля; `401` — неверный email или пароль (одинаковое сообщение для обоих случаев); `500` — ошибка сервера. Токен в примере условный, не действующий.

### 7.5. GET `/api/auth/me` — текущий пользователь

- **Доступ:** любой авторизованный пользователь. **Заголовок:** `Authorization: Bearer <accessToken>`. **Параметры и тело:** отсутствуют.
- **200 OK:**

```json
{"user":{"id":3,"name":"Demo User","email":"demo@example.com","role":"user"}}
```

- **Ошибки:** `401` — токен отсутствует, неверен или истёк; `500` — ошибка сервера.

### 7.6. GET `/api/auth/admin-check` — проверка роли

- **Доступ:** только admin. **Заголовок:** `Authorization: Bearer <accessToken>`. **Параметры и тело:** отсутствуют.
- **200 OK:** `{"message":"Доступ администратора разрешён"}`.
- **Ошибки:** `401` — отсутствует/невалиден JWT; `403` — роль не `admin`; `500` — ошибка сервера.

### 7.7. GET `/api/categories` — список категорий

- **Доступ:** публичный. **Заголовки, параметры и тело:** отсутствуют.
- **200 OK:**

```json
[{"id":1,"name":"Автомасла"},{"id":2,"name":"Автозапчасти"},{"id":3,"name":"Шины и диски"},{"id":4,"name":"Автоаксессуары"}]
```

- **Ошибки:** `500` — сбой запроса к БД.

### 7.8. GET `/api/products` — все товары

- **Доступ:** публичный. **Заголовки, параметры и тело:** отсутствуют.
- **200 OK:** массив товаров, включая сведения о категории. Пример:

```json
[
  {
    "id":1,
    "name":"Моторное масло 5W-30",
    "description":"Синтетическое моторное масло, 1 литр",
    "price":"8500",
    "stock":15,
    "categoryId":1,
    "createdAt":"2026-11-25T19:07:00.210Z",
    "category":{"id":1,"name":"Автомасла"}
  }
]
```

- **Ошибки:** `500` — ошибка сервера/БД. Пустой каталог возвращает `200` и `[]`.
- **Примечание:** `price` сериализуется как строка, поскольку поле в Prisma имеет тип `Decimal`.

### 7.9. GET `/api/products/:id` — один товар

- **Доступ:** публичный. **Параметр:** `:id` — ID товара. **Тело:** отсутствует.
- **200 OK:** один объект товара в том же формате, что элемент массива `GET /api/products`.
- **Ошибки:** `400` — неверный ID, `404` — товар не найден, `500` — ошибка сервера.

### 7.10. POST `/api/products` — создание товара

- **Доступ:** только admin. **Заголовки:** `Content-Type: application/json`, `Authorization: Bearer <accessToken>`.
- **Тело:** `name` (строка от 2 символов), `description` (необязательная строка), `price` (число больше нуля), `stock` (целое число от 0), `categoryId` (положительное целое число).

```json
{"name":"Тормозная жидкость DOT 4","description":"Тормозная жидкость для автомобиля","price":4200,"stock":10,"categoryId":2}
```

- **201 Created:** созданный объект товара с `id`, `createdAt` и объектом `category` (тот же формат, что при `GET /api/products/:id`).
- **Ошибки:** `400` — неверные поля; `401` — нет JWT; `403` — не admin; `409` — отсутствует связанная категория; `500` — ошибка сервера.

### 7.11. PATCH `/api/products/:id` — изменение товара

- **Доступ:** только admin. **Параметр:** `:id` — ID товара. **Заголовки:** JSON + Bearer JWT.
- **Тело:** один или несколько полей `name`, `description`, `price`, `stock`, `categoryId`; остальные поля остаются неизменными.

```json
{"price":5000,"stock":20}
```

- **200 OK:** обновлённый объект товара, включая `category`.
- **Ошибки:** `400` — неверный ID, пустое или некорректное тело; `401` — без JWT; `403` — нет прав; `404` — товар не найден; `409` — неверная категория; `500` — ошибка сервера.

### 7.12. DELETE `/api/products/:id` — удаление товара

- **Доступ:** только admin. **Параметр:** `:id` — ID товара. **Заголовок:** Bearer JWT. **Тело:** отсутствует.
- **200 OK:**

```json
{"message":"Товар успешно удалён","productId":4}
```

- **Ошибки:** `400` — неверный ID; `401` — без JWT; `403` — нет прав; `404` — товара нет; `409` — есть мешающие удалению связанные записи; `500` — ошибка сервера.

### 7.13. GET `/api/products/:id/reviews` — отзывы товара

- **Доступ:** публичный. **Параметр:** `:id` — ID товара. **Тело:** отсутствует.
- **200 OK:** массив отзывов с публичным именем автора:

```json
[{"id":1,"rating":4,"comment":"Хорошее масло","userId":1,"productId":1,"createdAt":"2026-11-25T15:00:00.000Z","user":{"id":1,"name":"Demo User"}}]
```

- **Ошибки:** `400` — неверный ID, `404` — товара нет, `500` — ошибка сервера. Если отзывов нет, возвращается `[]`.

### 7.14. POST `/api/products/:id/reviews` — создать отзыв

- **Доступ:** любой пользователь с JWT. **Параметр:** `:id` — ID товара. **Заголовки:** JSON + Bearer JWT.
- **Тело:** `rating` — целое от 1 до 5, `comment` — необязательная строка длиной до 1000 символов.

```json
{"rating":5,"comment":"Отличное моторное масло, рекомендую!"}
```

- **201 Created**, пример:

```json
{"id":1,"rating":5,"comment":"Отличное моторное масло, рекомендую!","userId":1,"productId":1,"createdAt":"2026-11-25T15:00:00.000Z"}
```

- **Ошибки:** `400` — неверные данные, `401` — без JWT, `404` — товар не найден, `409` — отзыв этого пользователя на товар уже существует (уникальность БД), `500` — ошибка сервера.

### 7.15. PATCH `/api/reviews/:id` — изменить свой отзыв

- **Доступ:** только автор отзыва с JWT. **Параметр:** `:id` — ID отзыва. **Заголовки:** JSON + Bearer JWT.
- **Тело:** `rating` и/или `comment`.

```json
{"rating":4}
```

- **200 OK:** обновлённый объект отзыва.
- **Ошибки:** `400` — неверный ID/данные; `401` — без JWT; `403` — не автор; `404` — отзыв не найден; `500` — ошибка сервера.

### 7.16. DELETE `/api/reviews/:id` — удалить отзыв

- **Доступ:** автор отзыва или admin, с JWT. **Параметр:** `:id` — ID отзыва. **Заголовок:** Bearer JWT. **Тело:** отсутствует.
- **200 OK:**

```json
{"message":"Отзыв успешно удалён","reviewId":2}
```

- **Ошибки:** `400` — неверный ID; `401` — без JWT; `403` — не автор и не admin; `404` — отзыва нет; `500` — ошибка сервера.

## 8. HTTP-ошибки

Основные коды, используемые в MotorTen API:

| Статус | Значение | Пример |
|---|---|---|
| `200 OK` | Успешный GET/PATCH/DELETE | Получен товар |
| `201 Created` | Ресурс создан | Регистрация, товар, отзыв |
| `400 Bad Request` | Неверный ID/JSON/поля | `{"error":"Некорректные данные товара"}` |
| `401 Unauthorized` | Нет или неверный JWT | `{"error":"Требуется авторизация"}` |
| `403 Forbidden` | Нет нужной роли или прав владельца | `{"error":"Недостаточно прав"}` |
| `404 Not Found` | Ресурс или путь не найден | `{"error":"Товар не найден"}` |
| `409 Conflict` | Конфликт уникальности/связи | `{"error":"Email уже зарегистрирован"}` |
| `500 Internal Server Error` | Непредвиденная ошибка | `{"error":"Внутренняя ошибка сервера"}` |

Централизованный `errorHandler` обрабатывает переданные через `next(error)` исключения. Дополнительно часть контроллеров пока формирует свои JSON-ответы в `catch`; формат и статусы необходимо сверить при итоговом тестировании.

## 9. Примеры тестирования в PowerShell

Не публикуйте настоящие JWT и пароли в README или скриншотах. Тестовые email и пароли ниже вымышленные; сначала зарегистрируйте своего локального пользователя.

**Регистрация (должна вернуть 201):**

```powershell
$body = @{name="Demo User";email="demo@example.com";password="ExamplePassword123!"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $body
```

**Вход и получение JWT:**

```powershell
$body = @{email="demo@example.com";password="ExamplePassword123!"} | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$headers = @{Authorization="Bearer $($login.accessToken)"}
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Headers $headers
```

**GET каталога:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products"
```

**Проверка прав `user` на admin-маршруте:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/admin-check" -Headers $headers
```

Ожидается `403 Forbidden`, если у вошедшего пользователя роль `user`.

**Запрос без JWT:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me"
```

Ожидается `401 Unauthorized`.

**Проверка HTTP-статуса без обработки ошибки PowerShell:**

```powershell
curl.exe -i http://localhost:3000/api/products/999
```

Ожидается `HTTP/1.1 404 Not Found` и JSON `{"error":"Товар не найден"}`.

**Полный CRUD-сценарий товара (только admin):**

```powershell
# Перед выполнением войдите под локальным admin и создайте $headers.
# Отправляем JSON, закодированный в UTF-8.
$body = @{name="Test Product";price=100;stock=1;categoryId=1} | ConvertTo-Json
$bytes = [Text.Encoding]::UTF8.GetBytes($body)
$created = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method POST -Headers $headers -ContentType "application/json; charset=utf-8" -Body $bytes
$id = $created.id

Invoke-RestMethod -Uri "http://localhost:3000/api/products/$id"

$patch = @{price=120;stock=2} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/products/$id" -Method PATCH -Headers $headers -ContentType "application/json" -Body $patch

Invoke-RestMethod -Uri "http://localhost:3000/api/products/$id" -Method DELETE -Headers $headers
```

**Тест отзыва (авторизованный пользователь):**

```powershell
# Для существующего продукта с ID 1.
$body = @{rating=5;comment="Test review"} | ConvertTo-Json
$review = Invoke-RestMethod -Uri "http://localhost:3000/api/products/1/reviews" -Method POST -Headers $headers -ContentType "application/json" -Body $body
Invoke-RestMethod -Uri "http://localhost:3000/api/products/1/reviews"
Invoke-RestMethod -Uri "http://localhost:3000/api/reviews/$($review.id)" -Method DELETE -Headers $headers
```

Если такой отзыв уже был оставлен, повторный POST может вернуть конфликт `409` из-за уникального индекса (`userId`, `productId`).

## 10. Безопасность и воспроизводимость

- Сохраняются только хеши паролей Argon2id, не исходные пароли.
- Роль `admin` нельзя получить через публичную регистрацию.
- Защищённые маршруты проверяют JWT; `requireRole('admin')` проверяет доступ по роли.
- Автор отзыва определяется из `req.user`, а не из `userId` клиента.
- Не отправляйте в HTTP-ответах поле `passwordHash`, ключ JWT или строку подключения.
- `.gitignore` должен исключать `.env`, `node_modules/` и временные файлы.
- Не удаляйте из Git миграции Prisma: они нужны для повторного развёртывания БД.
- Перед сдачей проверьте запуск проекта на чистой базе по этому README.

## 11. Результаты и авторство

**Демонстрационные результаты:** выполнены запросы получения категорий и товаров, регистрации и входа, проверки ролей (включая `401`/`403`), создания/изменения/удаления товара и отзыва. Примеры выше относятся к локальной учебной базе, а не к опубликованному серверу.

**Автор:** Омаров Ратмир Артурович  
**Учебная группа:** 16 РПО/25  
**Дата:** 25.11.2026  
**Репозиторий GitHub:** https://github.com/911Archangel911/motorten-api

---


