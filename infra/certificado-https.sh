#!/bin/bash
# Certificado HTTPS válido (Let's Encrypt) para la VM de GCP. Se ejecuta EN la VM, en /opt/tu-vecino:
#   sudo bash certificado-https.sh
# Requisitos: SITIO_SEGURO en .env (ej. 34-176-116-202.sslip.io) y el sitio respondiendo en el puerto 80.
# - Obtiene (o reutiliza) el certificado por validación webroot, sin detener Nginx.
# - Recrea el frontend para que use el certificado y active la redirección http → https.
# - Programa la renovación automática diaria (los certificados duran 90 días; certbot renueva a los 60).
# No se envía ningún correo a Let's Encrypt (--register-unsafely-without-email).
set -euo pipefail
cd /opt/tu-vecino

SITIO="$(grep -E '^SITIO_SEGURO=' .env | cut -d= -f2- | tr -d '[:space:]')"
[ -n "$SITIO" ] || { echo "Falta SITIO_SEGURO en .env"; exit 1; }

echo "▶ Certificado para $SITIO…"
docker compose --profile certbot run --rm certbot certonly \
  --webroot -w /var/www/certbot -d "$SITIO" \
  --agree-tos --register-unsafely-without-email -n --keep-until-expiring

echo "▶ Aplicando el certificado en Nginx…"
docker compose up -d --force-recreate frontend

echo "▶ Renovación automática (cron diario 03:17)…"
cat > /etc/cron.d/tu-vecino-certificado <<'CRON'
# Renueva el certificado de Let's Encrypt y recarga Nginx (Tu Vecino)
17 3 * * * root cd /opt/tu-vecino && docker compose --profile certbot run --rm certbot renew -q && docker compose exec -T frontend nginx -s reload >/dev/null 2>&1
CRON
chmod 644 /etc/cron.d/tu-vecino-certificado

echo "✔ Listo: https://$SITIO"
