# Frontend de Tu Vecino: compilación con Vite + Nginx (estáticos, proxy /api y HTTPS)

# 1) Compilación
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Servidor web
FROM nginx:1.27-alpine
RUN apk add --no-cache openssl
# Plantilla: la imagen oficial la convierte en /etc/nginx/conf.d/default.conf al iniciar (envsubst)
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
# Los scripts de /docker-entrypoint.d/ se ejecutan (.sh) o se cargan (.envsh) antes de iniciar Nginx
COPY docker/05-sitio-seguro.envsh /docker-entrypoint.d/05-sitio-seguro.envsh
COPY docker/10-certificado.sh /docker-entrypoint.d/10-certificado.sh
RUN chmod +x /docker-entrypoint.d/05-sitio-seguro.envsh /docker-entrypoint.d/10-certificado.sh && mkdir -p /var/www/certbot
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
