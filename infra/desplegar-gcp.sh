#!/bin/bash
# Despliega el último commit en la VM de GCP (proyecto tu-vecino-ves).
# Uso (desde la raíz del repo, en Git Bash):  bash infra/desplegar-gcp.sh
#
# Requisitos: gcloud con sesión iniciada y el archivo .env.produccion en la raíz
# (no se sube a git). SSH va por el túnel IAP de Google (funciona aunque la red bloquee el puerto 22).
set -euo pipefail

PROYECTO=tu-vecino-ves
ZONA=southamerica-west1-a
VM=tu-vecino-vm
GCLOUD="${GCLOUD:-gcloud}"
TMP="$(mktemp -d)"

[ -f .env.produccion ] || { echo "Falta .env.produccion en la raíz del repo"; exit 1; }

echo "▶ Empaquetando $(git rev-parse --short HEAD)…"
git archive --format=tar.gz -o "$TMP/tu-vecino.tar.gz" HEAD backend frontend docker-compose.yml .gitattributes
cp .env.produccion "$TMP/env.produccion"

echo "▶ Copiando a la VM…"
( cd "$TMP" && "$GCLOUD" compute scp tu-vecino.tar.gz env.produccion "$VM":/tmp/ \
    --project="$PROYECTO" --zone="$ZONA" --tunnel-through-iap --quiet )

echo "▶ Construyendo y levantando…"
"$GCLOUD" compute ssh "$VM" --project="$PROYECTO" --zone="$ZONA" --tunnel-through-iap --quiet --command='
  set -e
  cd /opt/tu-vecino
  sudo tar xzf /tmp/tu-vecino.tar.gz -C /opt/tu-vecino
  sudo mv /tmp/env.produccion /opt/tu-vecino/.env && sudo chmod 600 /opt/tu-vecino/.env
  rm -f /tmp/tu-vecino.tar.gz
  sudo docker compose up -d --build
  sudo docker image prune -f >/dev/null
  sudo docker compose ps --format "table {{.Name}}\t{{.Status}}"
'

rm -rf "$TMP"
echo "✔ Desplegado"
