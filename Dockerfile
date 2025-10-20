FROM repository.groupe1.local:80/dungeoncrawler/node:24.8.0-alpine

WORKDIR /app

# Copie package.json et lock
COPY package*.json ./

# Installe les dépendances
RUN npm ci

# Copie le reste du projet
COPY . .

# Build Nuxt en production
RUN npm run build

# Expose le port 3000
EXPOSE 3000

# Lance Nuxt SSR en production
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
