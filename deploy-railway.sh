#!/bin/bash

# Script de Deploy Automático - Railway
# Execute este script no seu terminal

set -e

echo "🚀 Deploy Automático - Empório Tecidos (Railway)"
echo "=================================================="
echo ""

# 1. Login
echo "📝 Passo 1: Login no Railway..."
echo "Seu navegador vai abrir. Faça login e autorize o CLI."
railway login

echo ""
echo "✅ Login concluído!"
echo ""

# 2. Criar projeto ou linkar existente
echo "📦 Passo 2: Configurando projeto..."
if railway status 2>/dev/null; then
    echo "✅ Projeto já está linkado!"
else
    echo "Criando novo projeto..."
    railway init --name emporio-tecidos-backend
fi

echo ""

# 3. Adicionar MySQL
echo "🗄️  Passo 3: Adicionando banco MySQL..."
railway add --database mysql || echo "MySQL já existe ou erro ao adicionar"

echo ""

# 4. Configurar variáveis de ambiente
echo "⚙️  Passo 4: Configurando variáveis de ambiente..."

railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET="emporio-tecidos-2025-$(openssl rand -hex 32)"
railway variables set JWT_EXPIRES_IN=7d
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set LOG_LEVEL=info
railway variables set FRONTEND_URL="https://temporary.vercel.app"
railway variables set DEFAULT_WHATSAPP_NUMBER="5531999999999"

echo ""
echo "✅ Variáveis configuradas!"
echo ""

# 5. Deploy
echo "🚀 Passo 5: Fazendo deploy do backend..."
cd backend
railway up --detach

echo ""
echo "✅ Deploy iniciado!"
echo ""

# 6. Obter URL
echo "🌐 Passo 6: Obtendo URL do backend..."
sleep 5
BACKEND_URL=$(railway domain)

echo ""
echo "=================================================="
echo "✅ BACKEND DEPLOYADO COM SUCESSO!"
echo "=================================================="
echo ""
echo "📍 URL do Backend: $BACKEND_URL"
echo ""
echo "Próximo passo:"
echo "1. Execute: ./deploy-vercel.sh"
echo "2. Use essa URL no frontend: $BACKEND_URL/api"
echo ""
