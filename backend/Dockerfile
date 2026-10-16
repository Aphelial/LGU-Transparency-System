FROM php:8.3-cli-alpine

RUN apk add --no-cache git unzip postgresql-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install pdo_pgsql mbstring bcmath pcntl zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

EXPOSE 10000
CMD ["sh", "-c", "php artisan migrate --force && if [ -n \"${ADMIN_EMAIL:-}\" ] && [ -n \"${ADMIN_PASSWORD:-}\" ]; then php artisan app:provision-admin; fi && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
