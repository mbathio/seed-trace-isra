# backend/scripts/diagnose.ps1 - Script de diagnostic pour Windows
param(
    [switch]$Fix = $false
)

$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

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

Write-Host "🔍 DIAGNOSTIC DU SYSTÈME ISRA SEED TRACE" -ForegroundColor $Blue
Write-Host "=======================================" -ForegroundColor $Blue
Write-Host ""

$issues = @()
$warnings = @()

# 1. Vérifier Node.js
Write-Info "1. Vérification de Node.js..."
try {
    $nodeVersion = node --version
    $versionNumber = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($versionNumber.Split('.')[0])
    
    if ($majorVersion -ge 18) {
        Write-Success "Node.js $nodeVersion installé ✓"
    } else {
        Write-Error "Node.js version obsolète: $nodeVersion (minimum requis: 18.x)"
        $issues += "Node.js version obsolète"
    }
} catch {
    Write-Error "Node.js non installé ou non accessible"
    $issues += "Node.js non installé"
}

# 2. Vérifier NPM
Write-Info "2. Vérification de NPM..."
try {
    $npmVersion = npm --version
    Write-Success "NPM $npmVersion installé ✓"
} catch {
    Write-Error "NPM non accessible"
    $issues += "NPM non accessible"
}

# 3. Vérifier la structure du projet
Write-Info "3. Vérification de la structure du projet..."
$requiredFiles = @(
    "package.json",
    "tsconfig.json", 
    "prisma/schema.prisma",
    "src/server.ts",
    "src/app.ts"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "$file ✓"
    } else {
        Write-Error "$file manquant"
        $issues += "Fichier manquant: $file"
    }
}

# 4. Vérifier le fichier .env
Write-Info "4. Vérification de la configuration..."
if (Test-Path ".env") {
    Write-Success "Fichier .env présent ✓"
    
    # Vérifier les variables importantes
    $envContent = Get-Content ".env" | Where-Object { $_ -match '^[^#].*=' }
    $envVars = @{}
    
    foreach ($line in $envContent) {
        if ($line -match '^([^=]+)=(.*)$') {
            $envVars[$matches[1]] = $matches[2]
        }
    }
    
    $requiredVars = @(
        "DATABASE_URL",
        "JWT_SECRET",
        "PORT",
        "CLIENT_URL"
    )
    
    foreach ($var in $requiredVars) {
        if ($envVars.ContainsKey($var) -and $envVars[$var]) {
            if ($var -eq "JWT_SECRET" -and $envVars[$var].Length -lt 32) {
                Write-Warning "$var trop court (${$envVars[$var].Length} caractères, minimum 32)"
                $warnings += "JWT_SECRET trop court"
            } else {
                Write-Success "$var défini ✓"
            }
        } else {
            Write-Error "$var non défini"
            $issues += "$var manquant"
        }
    }
} else {
    Write-Error "Fichier .env manquant"
    $issues += "Fichier .env manquant"
    
    if ($Fix -and (Test-Path ".env.example")) {
        Write-Info "Création du fichier .env depuis .env.example..."
        Copy-Item ".env.example" ".env"
        Write-Success "Fichier .env créé"
    }
}

# 5. Vérifier les dépendances
Write-Info "5. Vérification des dépendances..."
if (Test-Path "node_modules") {
    Write-Success "Dossier node_modules présent ✓"
    
    # Vérifier quelques dépendances clés
    $keyDeps = @("express", "prisma", "@prisma/client", "typescript")
    foreach ($dep in $keyDeps) {
        if (Test-Path "node_modules/$dep") {
            Write-Success "$dep installé ✓"
        } else {
            Write-Warning "$dep potentiellement manquant"
            $warnings += "$dep manquant"
        }
    }
} else {
    Write-Error "Dossier node_modules manquant"
    $issues += "Dépendances non installées"
    
    if ($Fix) {
        Write-Info "Installation des dépendances..."
        npm install
    }
}

# 6. Vérifier PostgreSQL
Write-Info "6. Vérification de PostgreSQL..."
if ($envVars.ContainsKey("DATABASE_URL")) {
    try {
        # Test simple de connexion
        $testResult = npx prisma db push --accept-data-loss 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL accessible ✓"
        } else {
            Write-Error "PostgreSQL non accessible ou erreur de configuration"
            $issues += "PostgreSQL non accessible"
        }
    } catch {
        Write-Error "Impossible de tester PostgreSQL"
        $issues += "Test PostgreSQL échoué"
    }
} else {
    Write-Warning "DATABASE_URL non défini, impossible de tester PostgreSQL"
}

# 7. Vérifier la compilation TypeScript
Write-Info "7. Vérification de TypeScript..."
try {
    $tscResult = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript compilation OK ✓"
    } else {
        Write-Warning "Erreurs de compilation TypeScript détectées"
        $warnings += "Erreurs TypeScript"
        Write-Host $tscResult -ForegroundColor $Yellow
    }
} catch {
    Write-Error "Impossible de vérifier TypeScript"
    $issues += "TypeScript non accessible"
}

# 8. Vérifier les dossiers requis
Write-Info "8. Vérification des dossiers..."
$requiredDirs = @("src", "prisma", "logs", "uploads")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Success "Dossier $dir ✓"
    } else {
        if ($dir -in @("logs", "uploads")) {
            Write-Warning "Dossier $dir manquant (sera créé automatiquement)"
            if ($Fix) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-Success "Dossier $dir créé"
            }
        } else {
            Write-Error "Dossier $dir manquant"
            $issues += "Dossier manquant: $dir"
        }
    }
}

# 9. Vérifier les ports
Write-Info "9. Vérification des ports..."
$port = if ($envVars.ContainsKey("PORT")) { $envVars["PORT"] } else { "3001" }
try {
    $portUsed = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portUsed) {
        Write-Warning "Port $port déjà utilisé"
        $warnings += "Port $port occupé"
    } else {
        Write-Success "Port $port disponible ✓"
    }
} catch {
    Write-Success "Port $port semble disponible ✓"
}

# Résumé
Write-Host ""
Write-Host "📊 RÉSUMÉ DU DIAGNOSTIC" -ForegroundColor $Blue
Write-Host "======================" -ForegroundColor $Blue

if ($issues.Count -eq 0) {
    Write-Success "🎉 Aucun problème critique détecté!"
} else {
    Write-Error "🚨 $($issues.Count) problème(s) critique(s) détecté(s):"
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor $Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Warning "⚠️  $($warnings.Count) avertissement(s):"
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor $Yellow
    }
}

Write-Host ""

# Recommandations
if ($issues.Count -gt 0 -or $warnings.Count -gt 0) {
    Write-Host "🔧 RECOMMANDATIONS" -ForegroundColor $Blue
    Write-Host "=================" -ForegroundColor $Blue
    
    if ("Node.js non installé" -in $issues) {
        Write-Host "• Installez Node.js 18+ depuis https://nodejs.org"
    }
    
    if ("Dépendances non installées" -in $issues) {
        Write-Host "• Exécutez: npm install"
    }
    
    if ("Fichier .env manquant" -in $issues) {
        Write-Host "• Copiez .env.example vers .env et configurez les variables"
    }
    
    if ("JWT_SECRET trop court" -in $warnings) {
        Write-Host "• Générez un JWT_SECRET plus long (64+ caractères recommandés)"
    }
    
    if ("PostgreSQL non accessible" -in $issues) {
        Write-Host "• Vérifiez que PostgreSQL est démarré"
        Write-Host "• Vérifiez DATABASE_URL dans .env"
        Write-Host "• Testez la connexion avec: npx prisma db push"
    }
    
    Write-Host ""
    Write-Host "Pour corriger automatiquement certains problèmes:"
    Write-Host ".\scripts\diagnose.ps1 -Fix" -ForegroundColor $Green
}

# Instructions de démarrage
if ($issues.Count -eq 0) {
    Write-Host ""
    Write-Host "🚀 PRÊT AU DÉMARRAGE" -ForegroundColor $Green
    Write-Host "===================" -ForegroundColor $Green
    Write-Host "Votre environnement semble prêt. Pour démarrer le serveur:"
    Write-Host ""
    Write-Host "Mode développement:" -ForegroundColor $Green
    Write-Host "  npm run dev" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Avec le script PowerShell:" -ForegroundColor $Green
    Write-Host "  .\scripts\start.ps1" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Mode production:" -ForegroundColor $Green
    Write-Host "  npm run build && npm start" -ForegroundColor $Blue
}