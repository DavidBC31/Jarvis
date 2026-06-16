#!/usr/bin/env bash
# Lancement de Jarvis en une commande : build le frontend (si Node présent),
# prépare l'environnement Python, puis démarre l'agrégateur qui sert
# l'interface ET l'API sur http://localhost:8000
set -euo pipefail
cd "$(dirname "$0")"

# 1. Build du frontend -> frontend/dist (servi par l'agrégateur)
if command -v npm >/dev/null 2>&1; then
  echo "▶ Build du frontend…"
  (cd frontend && npm install --no-audit --no-fund && npm run build)
else
  echo "⚠ Node/npm introuvable — le frontend ne sera pas (re)buildé."
  echo "  Installe Node 18+ puis relance ce script. (L'API restera disponible.)"
fi

# 2. Environnement Python + dépendances
cd backend
if [ ! -d .venv ]; then
  echo "▶ Création de l'environnement Python…"
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
echo "▶ Installation des dépendances backend…"
pip install -q -r requirements.txt

# 3. Démarrage (0.0.0.0 -> accessible aussi depuis d'autres écrans du LAN)
echo
echo "✅ Jarvis : http://localhost:8000        (admin : http://localhost:8000/#admin)"
echo "   (Ctrl+C pour arrêter)"
echo
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
