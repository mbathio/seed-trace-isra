# ===== Dockerfile corrigé =====
# Utiliser une image Node.js plus récente et sécurisée
FROM node:20-alpine3.18

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S isra -u 1001

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY --chown=isra:nodejs . .

# Construire l'application
RUN npm run build

# Créer le dossier logs avec les bonnes permissions
RUN mkdir -p logs && chown -R isra:nodejs logs

# Passer à l'utilisateur non-root
USER isra

# Exposer le port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Démarrer l'application
CMD ["npm", "start"]

# ===== docker-compose.yml corrigé =====