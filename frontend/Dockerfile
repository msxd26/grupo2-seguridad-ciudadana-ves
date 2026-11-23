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
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Los scripts de /docker-entrypoint.d/ se ejecutan antes de iniciar Nginx
COPY docker/10-certificado.sh /docker-entrypoint.d/10-certificado.sh
RUN chmod +x /docker-entrypoint.d/10-certificado.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
