#!/usr/bin/env bash
# Script de build para Render

echo "===== Iniciando build do backend ====="

# Instalar dependências
echo "1. Instalando dependências..."
npm install

# Gerar Prisma Client
echo "2. Gerando Prisma Client..."
npx prisma generate

# Aplicar migrations (apenas em produção)
if [ "$NODE_ENV" = "production" ]; then
  echo "3. Aplicando migrations do banco de dados..."
  npx prisma migrate deploy
fi

echo "===== Build concluído com sucesso! ====="
