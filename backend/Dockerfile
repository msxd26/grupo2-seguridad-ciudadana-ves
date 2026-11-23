# API de Tu Vecino (Express + MySQL)
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Dependencias primero (aprovecha la caché de capas)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

USER node
EXPOSE 3000

# Espera a MySQL, migra, carga datos si faltan e inicia la API
CMD ["node", "database/inicializar.js"]
