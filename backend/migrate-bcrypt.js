// migrate-bcrypt.js
const fs = require("fs");
const path = require("path");

console.log("🔄 Migration de bcrypt vers bcryptjs...\n");

// Fonction pour remplacer les imports dans un fichier
function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Remplacer les imports TypeScript/ES6
    if (
      content.includes('from "bcrypt"') ||
      content.includes("from 'bcrypt'")
    ) {
      content = content.replace(/from\s+["']bcrypt["']/g, 'from "bcryptjs"');
      modified = true;
    }

    // Remplacer les imports avec destructuring
    if (
      content.includes('} from "bcrypt"') ||
      content.includes("} from 'bcrypt'")
    ) {
      content = content.replace(
        /}\s+from\s+["']bcrypt["']/g,
        '} from "bcryptjs"'
      );
      modified = true;
    }

    // Remplacer les require
    if (
      content.includes('require("bcrypt")') ||
      content.includes("require('bcrypt')")
    ) {
      content = content.replace(
        /require\(["']bcrypt["']\)/g,
        'require("bcryptjs")'
      );
      modified = true;
    }

    // Remplacer import * as bcrypt
    if (
      content.includes('* as bcrypt from "bcrypt"') ||
      content.includes("* as bcrypt from 'bcrypt'")
    ) {
      content = content.replace(
        /\*\s+as\s+bcrypt\s+from\s+["']bcrypt["']/g,
        '* as bcrypt from "bcryptjs"'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Mis à jour: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDirectory(dir) {
  let filesUpdated = 0;

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules, dist et .git
      if (!["node_modules", "dist", ".git"].includes(file)) {
        filesUpdated += walkDirectory(filePath);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      if (replaceInFile(filePath)) {
        filesUpdated++;
      }
    }
  });

  return filesUpdated;
}

// Liste des fichiers spécifiques à vérifier
const specificFiles = [
  "./src/utils/encryption.ts",
  "./src/services/AuthService.ts",
  "./src/services/UserService.ts",
  "./prisma/seed.ts",
  "./tests/setup.ts",
];

console.log("📁 Vérification des fichiers spécifiques...\n");
let specificUpdated = 0;

specificFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    if (replaceInFile(file)) {
      specificUpdated++;
    }
  }
});

console.log("\n📁 Parcours des dossiers...\n");

// Parcourir tous les dossiers
let totalUpdated = specificUpdated;

if (fs.existsSync("./src")) {
  totalUpdated += walkDirectory("./src");
}

if (fs.existsSync("./prisma")) {
  totalUpdated += walkDirectory("./prisma");
}

if (fs.existsSync("./tests")) {
  totalUpdated += walkDirectory("./tests");
}

console.log(`\n✅ Migration terminée ! ${totalUpdated} fichiers mis à jour.`);
console.log("\n📝 Prochaines étapes:");
console.log("1. npm install (pour s'assurer que bcryptjs est installé)");
console.log("2. npx prisma generate");
console.log("3. npm run seed");
