# Image unique Jarvis : build du frontend (Node) puis service par l'agrégateur (Python).

# --- Étape 1 : build du frontend -------------------------------------------
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# --- Étape 2 : runtime backend (sert l'API + la SPA buildée) ----------------
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
# La SPA buildée est servie par l'agrégateur depuis ../frontend/dist (cf. main.py).
COPY --from=frontend /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
