## Configuration de l'environnement de développement

### Variables d'environnement

```
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/isra_seeds?schema=public"

# JWT
JWT_SECRET="votre_secret_jwt_très_sécurisé"
JWT_EXPIRES_IN="1d"

# Serveur
PORT=5000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### Scripts NPM

- `npm run dev` : Démarrer le serveur en mode développement avec nodemon
- `npm run build` : Compiler les fichiers TypeScript
- `npm start` : Démarrer le serveur en mode production
- `npm test` : Exécuter les tests
- `npm run seed` : Alimenter la base de données avec des données initiales
- `npm run prisma:migrate` : Créer/appliquer les migrations de la base de données
- `npm run prisma:generate` : Générer les types Prisma
- `npm run prisma:studio` : Ouvrir Prisma Studio pour explorer la base de données

## Bonnes pratiques

1. **Transactions** : Utiliser les transactions Prisma pour les opérations multi-tables
2. **Validation** : Valider toutes les entrées utilisateur avec le middleware de validation
3. **Logging** : Logger les erreurs et les événements importants
4. **Tests** : Écrire des tests pour les nouvelles fonctionnalités
5. **Commentaires** : Documenter les fonctions et méthodes complexes

## Ressources supplémentaires

- [Documentation Prisma](https://www.prisma.io/docs/)
- [Documentation Express](https://expressjs.com/fr/api.html)
- [Documentation JWT](https://github.com/auth0/node-jsonwebtoken#readme)
- [Documentation QRCode](https://github.com/soldair/node-qrcode#readme)

## Dépannage

### Problèmes courants

1. **Erreurs de migration Prisma** :

   - Solution : `npx prisma migrate reset` pour réinitialiser la base de données

2. **Problèmes d'authentification** :

   - Vérifier la validité du JWT_SECRET
   - Vérifier l'expiration du token

3. **Erreurs de validation** :
   - Vérifier les formats des entrées utilisateur
   - Consulter les journaux pour les détails précis

## Extension du projet

Pour ajouter une nouvelle entité au projet :

1. Ajouter le modèle dans `prisma/schema.prisma`
2. Exécuter `npm run prisma:migrate` pour créer la migration
3. Créer le contrôleur dans `src/controllers/`
4. Créer les routes dans `src/routes/`
5. Ajouter les routes au fichier `src/routes/index.ts`
6. Écrire des tests pour les nouvelles fonctionnalités

## Contact et assistance

Pour toute question technique, contactez l'équipe de développement
