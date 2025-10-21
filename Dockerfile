FROM node:24.8.0-alpine

WORKDIR /app

# Copie package.json et lock
COPY package*.json ./

# Installe les dépendances
RUN npm ci

# Installe dotenv-cli pour charger le .env au runtime
RUN npm install --omit=dev dotenv-cli

# Copie le reste du projet
COPY . .

# Build Nuxt en production
RUN npm run build

# Expose le port 3000
EXPOSE 3000

# Lance Nuxt SSR en production avec les variables du .env
CMD ["npx", "dotenv", "-e", ".env", "--", "node", ".output/server/index.mjs"]
