# Docker Развертывание

## Быстрый старт

### 1. Базовый запуск

```bash
# Сборка и запуск
docker-compose up -d

# Проверка логов
docker-compose logs -f

# Остановка
docker-compose down
```

Откройте: **http://localhost:33005**
Логин: **admin** / **changeme**

### 2. С пользовательскими настройками

```bash
# Создайте .env файл
cat > .env << EOF
KB_PORT=3000
KB_AUTH_USER=myuser
KB_AUTH_PASS=mypassword
EOF

# Запуск
docker-compose up -d
```

## Конфигурация

### Переменные окружения

Отредактируйте `.env` или измените `docker-compose.yml`:

```env
# Порт приложения (хост)
KB_PORT=8080

# Аутентификация
KB_AUTH_USER=admin
KB_AUTH_PASS=changeme
```

### Постоянное хранилище

Vault (markdown файлы) монтируется в `./vault`:

```yaml
volumes:
  - ./vault:/data/vault:rw
```

Все ваши заметки хранятся локально в папке `vault/`.

## Команды Docker

### Управление контейнером

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Логи
docker-compose logs -f kb

# Статус
docker-compose ps

# Статистика (CPU, память)
docker stats knowledge-base
```

### Обновление

```bash
# Пересборка после изменений
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Или быстрая пересборка
docker-compose up -d --build
```

### Очистка

```bash
# Удалить контейнер и образ
docker-compose down --rmi all

# Удалить volumes (ВНИМАНИЕ: удалит данные!)
docker-compose down -v
```

## Production развертывание

### С HTTPS (Traefik)

```bash
# 1. Создайте сеть Traefik
docker network create traefik-network

# 2. Отредактируйте docker-compose.prod.yml
# Замените kb.yourdomain.com на ваш домен

# 3. Запустите
docker-compose -f docker-compose.prod.yml up -d
```

### С Nginx Reverse Proxy

```bash
# 1. Запустите приложение на localhost:33005
docker-compose up -d

# 2. Настройте Nginx
sudo nano /etc/nginx/sites-available/kb
```

```nginx
server {
    listen 80;
    server_name kb.yourdomain.com;

    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kb.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/kb.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kb.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:33005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 3. Активируйте
sudo ln -s /etc/nginx/sites-available/kb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Systemd сервис (без Docker Compose)

```bash
# Создайте сервис
sudo nano /etc/systemd/system/kb.service
```

```ini
[Unit]
Description=Knowledge Base
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/user/obsidian
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Активируйте
sudo systemctl daemon-reload
sudo systemctl enable kb
sudo systemctl start kb
```

## Healthcheck

Контейнер имеет встроенную проверку здоровья:

```bash
# Проверка статуса
docker inspect knowledge-base | grep -A 10 Health

# Или
docker-compose ps
```

Healthcheck делает GET запрос каждые 30 секунд.

## Мониторинг

### Логи

```bash
# Все логи
docker-compose logs -f

# Только последние 100 строк
docker-compose logs --tail=100 kb

# С временными метками
docker-compose logs -f -t kb
```

### Метрики

```bash
# Использование ресурсов
docker stats knowledge-base

# Или с docker-compose
docker-compose stats
```

## Бэкапы

### Автоматический бэкап vault

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/kb"
VAULT_DIR="./vault"

# Создать бэкап
tar -czf "$BACKUP_DIR/vault_$DATE.tar.gz" "$VAULT_DIR"

# Удалить старые (>30 дней)
find "$BACKUP_DIR" -name "vault_*.tar.gz" -mtime +30 -delete

echo "Backup completed: vault_$DATE.tar.gz"
```

```bash
# Сделать исполняемым
chmod +x backup.sh

# Добавить в crontab (ежедневно в 2:00)
crontab -e
# 0 2 * * * /path/to/backup.sh
```

## Решение проблем

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs kb

# Проверьте порт
sudo lsof -i :33005

# Пересоберите без кеша
docker-compose build --no-cache
docker-compose up -d
```

### Не видно файлы в vault

```bash
# Проверьте монтирование
docker-compose exec kb ls -la /data/vault

# Проверьте права
ls -la vault/
```

### Healthcheck fails

```bash
# Проверьте доступность
docker-compose exec kb wget -O- http://localhost:33005/

# Проверьте статус
docker inspect knowledge-base --format='{{.State.Health.Status}}'
```

### Большой размер образа

```bash
# Проверьте размер
docker images knowledge-base

# Очистите неиспользуемые слои
docker system prune -a
```

## Multi-stage build

Dockerfile использует multi-stage build для минимизации размера:

1. **Stage 1**: Сборка frontend (Node.js)
2. **Stage 2**: Сборка backend (Go)
3. **Stage 3**: Runtime (Alpine Linux)

Итоговый образ: **~20-30MB** (без учёта базового Alpine)

## Кастомизация образа

### Изменить базовый образ

Отредактируйте `Dockerfile`:

```dockerfile
# Вместо alpine:latest
FROM ubuntu:22.04
```

### Добавить зависимости

```dockerfile
# В runtime stage
RUN apk --no-cache add curl vim
```

### Изменить порт

```yaml
# docker-compose.yml
ports:
  - "3000:33005"  # Хост:Контейнер
```

## Docker Hub (опционально)

### Публикация образа

```bash
# Войдите в Docker Hub
docker login

# Соберите с тегом
docker build -t yourusername/knowledge-base:latest .

# Загрузите
docker push yourusername/knowledge-base:latest
```

### Использование готового образа

```yaml
# docker-compose.yml
services:
  kb:
    image: yourusername/knowledge-base:latest
    # Без build:
```

## Примеры использования

### 1. Локальная разработка

```bash
docker-compose up -d
# Редактируйте файлы в vault/
# Изменения видны сразу
```

### 2. Production сервер

```bash
docker-compose -f docker-compose.prod.yml up -d
# С HTTPS через Traefik
```

### 3. Несколько инстансов

```yaml
# docker-compose.multi.yml
services:
  kb-personal:
    build: .
    ports:
      - "8080:33005"
    volumes:
      - ./vault-personal:/data/vault
    environment:
      - KB_AUTH_USER=user1

  kb-work:
    build: .
    ports:
      - "8081:33005"
    volumes:
      - ./vault-work:/data/vault
    environment:
      - KB_AUTH_USER=user2
```

## Полезные ссылки

- Docker документация: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Best practices: https://docs.docker.com/develop/dev-best-practices/

## Поддержка

Проблемы с Docker? Проверьте:

1. `docker-compose logs -f` - логи
2. `docker-compose ps` - статус
3. `docker stats` - ресурсы
4. `TEST.md` - troubleshooting guide
