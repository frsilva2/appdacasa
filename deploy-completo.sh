#!/bin/bash

# 🚀 SCRIPT DE DEPLOY COMPLETO - EMPÓRIO TECIDOS
# Automatiza 100% do deploy (Railway + Vercel)

set -e

clear

cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🚀 DEPLOY AUTOMÁTICO - EMPÓRIO TECIDOS 🚀            ║
║                                                           ║
║     Este script vai:                                      ║
║     1. Deploy do Backend (Railway + MySQL)                ║
║     2. Deploy do Frontend (Vercel)                        ║
║     3. Conectar tudo automaticamente                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF

echo ""
echo "Pressione ENTER para começar..."
read

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 PARTE 1: BACKEND (Railway)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ========================================
# BACKEND - RAILWAY
# ========================================

echo "📝 [1/6] Login no Railway..."
railway login

echo ""
echo "✅ Login concluído!"
echo ""

echo "📦 [2/6] Criando projeto no Railway..."
cd backend

# Inicializar projeto
if railway status 2>/dev/null; then
    echo "✅ Projeto já linkado!"
else
    railway init --name emporio-tecidos-backend
fi

echo ""
echo "🗄️  [3/6] Adicionando MySQL..."
railway add --database mysql || echo "⚠️  MySQL já existe ou erro ao adicionar (continuar...)"

echo ""
echo "⚙️  [4/6] Configurando variáveis de ambiente..."

# Gerar JWT_SECRET seguro
JWT_SECRET="emporio-tecidos-2025-$(openssl rand -hex 32 2>/dev/null || echo 'fallback-secret-key-change-me')"

railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set RATE_LIMIT_WINDOW_MS="900000"
railway variables set RATE_LIMIT_MAX_REQUESTS="100"
railway variables set LOG_LEVEL="info"
railway variables set FRONTEND_URL="https://temporary.vercel.app"

echo ""
echo "✅ Variáveis configuradas!"
echo ""

echo "🚀 [5/6] Deploy do backend..."
railway up --detach

echo ""
echo "⏳ Aguardando deploy... (30 segundos)"
sleep 30

echo ""
echo "🌐 [6/6] Obtendo URL do backend..."
BACKEND_URL=$(railway domain 2>/dev/null || railway status | grep "https://" | awk '{print $NF}' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️  Não consegui detectar URL automaticamente."
    echo "Verifique em: https://railway.app"
    echo ""
    read -p "Cole a URL do backend aqui: " BACKEND_URL
fi

# Remover https:// se tiver
BACKEND_URL="https://${BACKEND_URL#https://}"
BACKEND_URL="${BACKEND_URL%/}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKEND DEPLOYADO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Backend URL: $BACKEND_URL"
echo "📍 API URL: $BACKEND_URL/api"
echo ""
echo "Pressione ENTER para continuar para o frontend..."
read

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔹 PARTE 2: FRONTEND (Vercel)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ========================================
# FRONTEND - VERCEL
# ========================================

echo "📝 [1/4] Login no Vercel..."
vercel login

echo ""
echo "✅ Login concluído!"
echo ""

cd frontend

echo "⚙️  [2/4] Configurando variável de ambiente..."
cat > .env.production <<EOF
VITE_API_URL=${BACKEND_URL}/api
EOF

echo "✅ VITE_API_URL=${BACKEND_URL}/api"
echo ""

echo "🚀 [3/4] Deploy do frontend no Vercel (produção)..."
FRONTEND_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  Não consegui detectar URL automaticamente."
    echo ""
    read -p "Cole a URL do frontend que apareceu acima: " FRONTEND_URL
fi

FRONTEND_URL="${FRONTEND_URL%/}"

echo ""
echo "📍 Frontend URL: $FRONTEND_URL"
echo ""

echo "🔗 [4/4] Conectando frontend com backend (atualizando CORS)..."
cd ../backend
railway variables set FRONTEND_URL="$FRONTEND_URL"

echo ""
echo "✅ CORS atualizado! Backend vai redeploy automaticamente."
echo ""

cd ..

# ========================================
# FINALIZAÇÃO
# ========================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOY COMPLETO! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Frontend: $FRONTEND_URL"
echo "📍 Backend:  $BACKEND_URL/api"
echo "📍 Health:   $BACKEND_URL/health"
echo ""
echo "🔐 Login padrão:"
echo "   Email: admin@emporio.com"
echo "   Senha: admin123"
echo ""
echo "⏳ Aguarde ~2 minutos para o backend completar o redeploy."
echo ""
echo "Salvando informações..."

# Salvar URLs em arquivo
cat > DEPLOY-INFO.txt <<EOF
=== DEPLOY EMPÓRIO TECIDOS ===
Data: $(date)

Frontend: $FRONTEND_URL
Backend: $BACKEND_URL/api
Health Check: $BACKEND_URL/health

Login:
  Email: admin@emporio.com
  Senha: admin123

Administração:
  Railway: https://railway.app
  Vercel: https://vercel.com/dashboard
EOF

echo ""
echo "✅ Informações salvas em: DEPLOY-INFO.txt"
echo ""
echo "Para testar:"
echo "  curl $BACKEND_URL/health"
echo "  curl $BACKEND_URL/api/health"
echo ""
echo "Acesse: $FRONTEND_URL"
echo ""
