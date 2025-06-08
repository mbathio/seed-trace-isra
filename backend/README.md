# Système de Traçabilité des Semences ISRA Saint-Louis - Backend

## 📋 Description

Backend API pour le système de traçabilité des semences de l'Institut Sénégalais de Recherches Agricoles (ISRA) Saint-Louis. Cette API fournit tous les services nécessaires pour gérer la traçabilité complète des semences, du niveau GO jusqu'au niveau R2.

## 🚀 Fonctionnalités

- **Authentification JWT** avec refresh tokens
- **Gestion des utilisateurs** et rôles (admin, manager, researcher, technician, inspector, multiplier)
- **Gestion des variétés** de semences
- **Traçabilité des lots** avec généalogie complète
- **Contrôle qualité** des semences
- **Gestion des parcelles** et analyses de sol
- **Suivi des multiplicateurs** et contrats
- **Gestion des productions** avec activités et problèmes
- **Génération de QR codes** pour traçabilité
- **Rapports et statistiques** avancés
- **API RESTful** avec validation Zod
- **Documentation Swagger** (en développement)

## 🛠️ Technologies

- **Node.js** + **TypeScript**
- **Express.js** pour l'API REST
- **Prisma ORM** + **PostgreSQL**
- **JWT** pour l'authentification
- **Bcrypt** pour le hashage des mots de passe
- **Zod** pour la validation des données
- **Winston** pour les logs
- **Jest** pour les tests
- **Docker** pour le déploiement

## 📦 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### 1. Cloner le projet

```bash
git clone <repository-url>
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

```bash
cp .env.example .env
```

Modifier le fichier `.env` avec vos configurations :

```env
DATABASE_URL="postgresql://username:password@localhost:5432/isra_seeds"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### 4. Base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Peupler la base de données avec des données de test
npm run db:seed
```

### 5. Démarrer le serveur

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 🐳 Docker

### Démarrage avec Docker Compose

```bash
docker-compose up -d
```

Cela démarre :

- PostgreSQL sur le port 5432
- Redis sur le port 6379
- API sur le port 3001

## 📚 API Documentation

### Authentification

#### POST /api/auth/login

```json
{
  "email": "adiop@isra.sn",
  "password": "12345"
}
```

#### GET /api/auth/me

Récupère les informations de l'utilisateur connecté.

#### POST /api/auth/refresh

```json
{
  "refreshToken": "your-refresh-token"
}
```

### Lots de Semences

#### GET /api/seed-lots

Paramètres de requête :

- `page`, `pageSize` : pagination
- `search` : recherche textuelle
- `level` : filtrer par niveau (GO, G1, G2, etc.)
- `status` : filtrer par statut
- `varietyId` : filtrer par variété
- `sortBy`, `sortOrder` : tri

#### POST /api/seed-lots

```json
{
  "varietyId": "sahel108",
  "level": "G1",
  "quantity": 1000,
  "productionDate": "2024-01-15",
  "multiplierId": 1,
  "parcelId": 1,
  "parentLotId": "SL-GO-2023-001",
  "notes": "Notes optionnelles"
}
```

#### GET /api/seed-lots/:id/genealogy

Récupère l'arbre généalogique complet d'un lot.

#### GET /api/seed-lots/:id/qr-code

Récupère le QR code d'un lot.

### Contrôle Qualité

#### POST /api/quality-controls

```json
{
  "lotId": "SL-G1-2023-001",
  "controlDate": "2024-01-20",
  "germinationRate": 95,
  "varietyPurity": 98.5,
  "moistureContent": 12.5,
  "seedHealth": 97,
  "observations": "Excellente qualité",
  "testMethod": "Standard ISTA"
}
```

### Utilisateurs et Rôles

#### Rôles disponibles :

- **admin** : Accès complet
- **manager** : Gestion et supervision
- **researcher** : Recherche et développement
- **technician** : Opérations techniques
- **inspector** : Contrôle qualité
- **multiplier** : Multiplicateur de semences

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📊 Base de Données

### Modèles principaux :

- **User** : Utilisateurs du système
- **Variety** : Variétés de semences
- **SeedLot** : Lots de semences avec traçabilité
- **QualityControl** : Contrôles qualité
- **Multiplier** : Multiplicateurs
- **Parcel** : Parcelles de production
- **Production** : Productions avec activités
- **Contract** : Contrats de multiplication
- **Report** : Rapports générés

### Relations clés :

- Généalogie des lots (parent/enfant)
- Multiplicateur ↔ Parcelles ↔ Productions
- Lots ↔ Contrôles qualité
- Utilisateurs ↔ Activités/Rapports

## 🔐 Sécurité

- **Rate limiting** : 100 requêtes/15min par IP
- **CORS** configuré pour le frontend
- **Helmet** pour les headers de sécurité
- **Validation stricte** avec Zod
- **Hash bcrypt** avec salt rounds élevé
- **JWT sécurisé** avec expiration courte

## 📝 Logs

Les logs sont stockés dans `/logs/` :

- `error.log` : Erreurs uniquement
- `combined.log` : Tous les logs

## 🚀 Déploiement

### Variables d'environnement production :

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=strong-production-secret
PORT=3001
```

### Étapes de déploiement :

1. Build de l'application : `npm run build`
2. Migration de la base : `npm run db:migrate`
3. Démarrage : `npm start`

## 🤝 Données de Test

### Comptes utilisateurs (mot de passe : `12345`) :

- `adiop@isra.sn` - Chercheur
- `fsy@isra.sn` - Technicien
- `mkane@isra.sn` - Manager
- `ondiaye@isra.sn` - Inspecteur
- `admin@isra.sn` - Administrateur

### Données incluses :

- 4 variétés de semences (Sahel 108, Sahel 202, ZM309, 73-33)
- 4 lots de semences avec QR codes
- 4 multiplicateurs avec parcelles
- Contrôles qualité et productions
- Historiques et rapports

## 📞 Support

Pour toute question ou problème :

- Vérifiez les logs dans `/logs/`
- Consultez la documentation API
- Vérifiez la configuration de la base de données

## 🔄 Scripts utiles

```bash
# Réinitialiser la base de données
npm run db:reset

# Ouvrir Prisma Studio
npm run db:studio

# Linter et formateur
npm run lint
npm run format

# Génération après modification du schéma
npm run db:generate
```

## 📄 License

MIT License - Voir le fichier LICENSE pour plus de détails.

---

**Développé pour l'ISRA Saint-Louis** 🌾
Système de traçabilité des semences pour l'agriculture sénégalaise.

// Instructions de démarrage rapide

## 🚀 Instructions de Démarrage Rapide

### 1. Setup avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repository-url>
cd backend

# Démarrer tous les services
docker-compose up -d

# Attendre que PostgreSQL soit prêt, puis migrer et seeder
npm run db:migrate
npm run db:seed
```

### 2. Setup manuel

```bash
# Installer les dépendances
npm install

# Configurer la base de données PostgreSQL
createdb isra_seeds

# Configurer l'environnement
cp .env.example .env
# Modifier .env avec vos paramètres

# Initialiser la base de données
npm run db:generate
npm run db:migrate
npm run db:seed

# Démarrer en mode développement
npm run dev
```

### 3. Vérification

- API : http://localhost:3001/health
- Base de données : npm run db:studio
- Logs : tail -f logs/combined.log

### 4. Test de l'API

```bash
# Test de connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adiop@isra.sn","password":"12345"}'

# Test des lots de semences
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/seed-lots
```

## 🎯 Points d'entrée principaux

- **Authentification** : `/api/auth/*`
- **Lots de semences** : `/api/seed-lots/*`
- **Contrôle qualité** : `/api/quality-controls/*`
- **Utilisateurs** : `/api/users/*`
- **Variétés** : `/api/varieties/*`
- **Parcelles** : `/api/parcels/*`
- **Multiplicateurs** : `/api/multipliers/*`
- **Productions** : `/api/productions/*`
- **Rapports** : `/api/reports/*`

Le backend est maintenant prêt à être utilisé avec le frontend React/TypeScript fourni ! 🎉
