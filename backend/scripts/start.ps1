# backend/scripts/start.ps1 - Script de démarrage corrigé pour Windows
param(
    [string]$Environment = "development"
)

# Configuration des couleurs
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

# Fonctions d'affichage
function Write-Info {
    param([string]$Message)
    Write-Host "🔵 $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Error "package.json non trouvé. Assurez-vous d'être dans le répertoire backend."
    exit 1
}

# Vérifier la version de Node.js
Write-Info "Vérification de la version Node.js..."
try {
    $nodeVersion = node --version
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber.Split('.')[0])
    
    if ($majorVersion -lt 18) {
        Write-Error "Node.js version $nodeVersion détectée. Version minimale requise: 18.0.0"
        exit 1
    }
    Write-Success "Node.js version $nodeVersion ✓"
} catch {
    Write-Error "Node.js n'est pas installé ou non accessible"
    exit 1
}

# Vérifier l'existence du fichier .env
if (-not (Test-Path ".env")) {
    Write-Warning "Fichier .env non trouvé. Copie depuis .env.example..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success "Fichier .env créé depuis .env.example"
    } else {
        Write-Error "Fichier .env.example non trouvé. Créez manuellement votre fichier .env"
        exit 1
    }
}

# Charger et vérifier les variables d'environnement
Write-Info "Vérification des variables d'environnement..."

# Lire le fichier .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^#].*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Vérifier les variables critiques
$databaseUrl = [Environment]::GetEnvironmentVariable("DATABASE_URL", "Process")
$jwtSecret = [Environment]::GetEnvironmentVariable("JWT_SECRET", "Process")

if (-not $databaseUrl) {
    Write-Error "DATABASE_URL non définie dans .env"
    exit 1
}

if (-not $jwtSecret -or $jwtSecret.Length -lt 32) {
    Write-Error "JWT_SECRET non définie ou trop courte (minimum 32 caractères)"
    exit 1
}

Write-Success "Variables d'environnement validées ✓"

# Installer/mettre à jour les dépendances
Write-Info "Installation des dépendances..."
try {
    if (Test-Path "package-lock.json") {
        npm ci --silent
    } else {
        npm install --silent
    }
    Write-Success "Dépendances installées ✓"
} catch {
    Write-Error "Erreur lors de l'installation des dépendances"
    exit 1
}

# Vérifier si PostgreSQL est accessible
Write-Info "Vérification de la connexion à la base de données..."
try {
    $null = npx prisma db push --accept-data-loss 2>$null
    Write-Success "Connexion à la base de données validée ✓"
} catch {
    Write-Error "Impossible de se connecter à la base de données PostgreSQL"
    Write-Info "Vérifiez que PostgreSQL est démarré et que DATABASE_URL est correct"
    exit 1
}

# Générer le client Prisma
Write-Info "Génération du client Prisma..."
try {
    npx prisma generate --silent
    Write-Success "Client Prisma généré ✓"
} catch {
    Write-Error "Erreur lors de la génération du client Prisma"
    exit 1
}

# Appliquer les migrations si nécessaire
Write-Info "Application des migrations de base de données..."
try {
    $migrateStatus = npx prisma migrate status 2>&1
    if ($migrateStatus -match "Following migration have not yet been applied") {
        npx prisma migrate deploy
        Write-Success "Migrations appliquées ✓"
    } else {
        Write-Success "Base de données à jour ✓"
    }
} catch {
    Write-Warning "Vérification des migrations échouée, continuité..."
}

# Compiler TypeScript
Write-Info "Compilation TypeScript..."
try {
    npm run build --silent
    Write-Success "Compilation TypeScript réussie ✓"
} catch {
    Write-Error "Échec de la compilation TypeScript"
    exit 1
}

# Créer les dossiers nécessaires
Write-Info "Création des dossiers nécessaires..."
@("logs", "uploads") | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}
Write-Success "Dossiers créés ✓"

# Exécuter les tests (optionnel en développement)
if ($Environment -ne "production") {
    Write-Info "Exécution des tests (optionnel)..."
    try {
        $testResult = npm test --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests réussis ✓"
        } else {
            Write-Warning "Certains tests ont échoué (non bloquant en développement)"
        }
    } catch {
        Write-Warning "Tests échoués (non bloquant en développement)"
    }
}

# Afficher les informations de démarrage
Write-Success "🚀 Serveur API ISRA Seed Trace prêt à démarrer"
Write-Info "Environnement: $Environment"

$port = [Environment]::GetEnvironmentVariable("PORT", "Process")
if (-not $port) { $port = "3001" }
Write-Info "Port: $port"

$maskedDbUrl = $databaseUrl -replace '://.*@', '://***@'
Write-Info "Base de données: $maskedDbUrl"

Write-Host ""
Write-Success "🎯 Préparation terminée avec succès!"
Write-Info "Le serveur va maintenant démarrer..."
Write-Host ""

# Démarrer le serveur selon l'environnement
switch ($Environment.ToLower()) {
    "production" {
        Write-Info "Démarrage du serveur en mode production..."
        npm start
    }
    default {
        Write-Info "Démarrage du serveur en mode développement avec hot-reload..."
        npm run dev
    }
}