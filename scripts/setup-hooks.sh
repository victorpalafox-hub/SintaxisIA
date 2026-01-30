#!/bin/bash
# Setup script para git hooks de SintaxisIA

echo "🔧 Configurando git hooks..."

# Configurar directorio de hooks
git config core.hooksPath .githooks

# Dar permisos de ejecución
chmod +x .githooks/pre-commit

echo "✅ Git hooks instalados correctamente"
echo ""
echo "El hook pre-commit validará automáticamente:"
echo "  - package-lock.json exista en los 3 directorios"
echo "  - package-lock.json NO esté en .gitignore"
echo "  - .env NO se esté commiteando"
echo "  - No haya archivos >5MB"
