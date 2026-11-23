#!/bin/sh
# Genera un certificado HTTPS autofirmado la primera vez (se guarda en un volumen).
# PUBLIC_HOST: IP o nombre con el que se accede desde la red local (ej. 192.168.1.20).
set -e

DIR=/etc/nginx/certs
CRT="$DIR/tuvecino.crt"
KEY="$DIR/tuvecino.key"
HOST="${PUBLIC_HOST:-localhost}"
MARCA="$DIR/.host"

mkdir -p "$DIR"

# Si ya existe para el mismo host, se reutiliza (evita volver a aceptar el aviso del navegador).
if [ -f "$CRT" ] && [ -f "$KEY" ] && [ "$(cat "$MARCA" 2>/dev/null)" = "$HOST" ]; then
  echo "certificado: se reutiliza el existente para $HOST"
  exit 0
fi

SAN="DNS:localhost,IP:127.0.0.1"
if echo "$HOST" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'; then
  SAN="$SAN,IP:$HOST"
elif [ "$HOST" != "localhost" ]; then
  SAN="$SAN,DNS:$HOST"
fi

openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout "$KEY" -out "$CRT" \
  -subj "/CN=Tu Vecino ($HOST)" \
  -addext "subjectAltName=$SAN" >/dev/null 2>&1

echo "$HOST" > "$MARCA"
echo "certificado: generado para $SAN"
