#!/bin/bash

# Script de Deploy Automático - Vercel (Frontend)
# Execute este script DEPOIS do deploy-railway.sh

set -e

echo "🎨 Deploy Automático - Frontend Empório Tecidos (Vercel)"
echo "========================================================="
echo ""

# Pedir URL do backend
echo "📝 Cole a URL do backend do Railway (exemplo: https://xxx.up.railway.app):"
read -p "URL Backend: " BACKEND_URL

# Remover barra final se existir
BACKEND_URL="${BACKEND_URL%/}"

echo ""
echo "✅ Backend URL: $BACKEND_URL/api"
echo ""

# 1. Login
echo "📝 Passo 1: Login no Vercel..."
echo "Seu navegador vai abrir. Faça login e autorize o CLI."
vercel login

echo ""
echo "✅ Login concluído!"
echo ""

# 2. Ir para pasta frontend
cd frontend

# 3. Criar .env.production
echo "⚙️  Passo 2: Criando arquivo .env.production..."
cat > .env.production <<EOF
VITE_API_URL=${BACKEND_URL}/api
EOF

echo "✅ Variável de ambiente configurada!"
echo ""

# 4. Deploy
echo "🚀 Passo 3: Fazendo deploy do frontend..."
vercel --prod

echo ""
echo "=================================================="
echo "✅ FRONTEND DEPLOYADO COM SUCESSO!"
echo "=================================================="
echo ""

# Obter URL do frontend
FRONTEND_URL=$(vercel inspect --prod 2>/dev/null | grep "url:" | awk '{print $2}' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  Não consegui detectar a URL automaticamente."
    echo ""
    echo "📝 Cole a URL do frontend que apareceu acima:"
    read -p "URL Frontend: " FRONTEND_URL
fi

echo ""
echo "📍 URL do Frontend: $FRONTEND_URL"
echo ""

# 5. Atualizar CORS no backend
echo "🔗 Passo 4: Atualizando CORS no backend..."
cd ../backend
railway variables set FRONTEND_URL="$FRONTEND_URL"

echo ""
echo "✅ CORS atualizado! Backend vai fazer redeploy automático."
echo ""
echo "=================================================="
echo "🎉 DEPLOY COMPLETO!"
echo "=================================================="
echo ""
echo "📍 Frontend: $FRONTEND_URL"
echo "📍 Backend: $BACKEND_URL/api"
echo ""
echo "Login padrão:"
echo "  Email: admin@emporio.com"
echo "  Senha: admin123"
echo ""
echo "Aguarde ~2 minutos para o backend completar o redeploy."
echo ""
