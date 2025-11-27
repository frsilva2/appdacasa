@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 🚀 SCRIPT DE DEPLOY COMPLETO - EMPÓRIO TECIDOS (Windows)
REM Automatiza deploy no Railway + Vercel

cls

echo ═══════════════════════════════════════════════════════════
echo.
echo      🚀 DEPLOY AUTOMÁTICO - EMPÓRIO TECIDOS 🚀
echo.
echo      Este script vai:
echo      1. Deploy do Backend (Railway + MySQL)
echo      2. Deploy do Frontend (Vercel)
echo      3. Conectar tudo automaticamente
echo.
echo ═══════════════════════════════════════════════════════════
echo.
pause

REM ========================================
REM BACKEND - RAILWAY
REM ========================================

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔹 PARTE 1: BACKEND (Railway)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📝 [1/6] Login no Railway...
railway login

echo.
echo ✅ Login concluído!
echo.

echo 📦 [2/6] Criando projeto no Railway...
cd backend

railway status >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Projeto já linkado!
) else (
    railway init --name emporio-tecidos-backend
)

echo.
echo 🗄️  [3/6] Adicionando MySQL...
railway add --database mysql

echo.
echo ⚙️  [4/6] Configurando variáveis de ambiente...

railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set JWT_SECRET=emporio-tecidos-2025-super-secret-key-production
railway variables set JWT_EXPIRES_IN=7d
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set LOG_LEVEL=info
railway variables set FRONTEND_URL=https://temporary.vercel.app

echo.
echo ✅ Variáveis configuradas!
echo.

echo 🚀 [5/6] Deploy do backend...
railway up --detach

echo.
echo ⏳ Aguardando deploy... (30 segundos)
timeout /t 30 /nobreak >nul

echo.
echo 🌐 [6/6] Obtendo URL do backend...
for /f "tokens=*" %%i in ('railway domain') do set BACKEND_URL=%%i

if "!BACKEND_URL!"=="" (
    echo ⚠️  Não consegui detectar URL automaticamente.
    set /p BACKEND_URL="Cole a URL do backend aqui: "
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ BACKEND DEPLOYADO!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📍 Backend URL: https://!BACKEND_URL!
echo 📍 API URL: https://!BACKEND_URL!/api
echo.
pause

cd ..

REM ========================================
REM FRONTEND - VERCEL
REM ========================================

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔹 PARTE 2: FRONTEND (Vercel)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo 📝 [1/4] Login no Vercel...
vercel login

echo.
echo ✅ Login concluído!
echo.

cd frontend

echo ⚙️  [2/4] Configurando variável de ambiente...
echo VITE_API_URL=https://!BACKEND_URL!/api > .env.production

echo ✅ VITE_API_URL=https://!BACKEND_URL!/api
echo.

echo 🚀 [3/4] Deploy do frontend no Vercel...
vercel --prod --yes

echo.
set /p FRONTEND_URL="Cole a URL do frontend que apareceu acima: "

echo.
echo 📍 Frontend URL: !FRONTEND_URL!
echo.

echo 🔗 [4/4] Conectando frontend com backend...
cd ..\backend
railway variables set FRONTEND_URL=!FRONTEND_URL!

echo.
echo ✅ CORS atualizado!
echo.

cd ..

REM ========================================
REM FINALIZAÇÃO
REM ========================================

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 DEPLOY COMPLETO! 🎉
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📍 Frontend: !FRONTEND_URL!
echo 📍 Backend:  https://!BACKEND_URL!/api
echo 📍 Health:   https://!BACKEND_URL!/health
echo.
echo 🔐 Login padrão:
echo    Email: admin@emporio.com
echo    Senha: admin123
echo.
echo ⏳ Aguarde ~2 minutos para o backend completar o redeploy.
echo.

REM Salvar informações
(
echo === DEPLOY EMPÓRIO TECIDOS ===
echo Data: %date% %time%
echo.
echo Frontend: !FRONTEND_URL!
echo Backend: https://!BACKEND_URL!/api
echo Health Check: https://!BACKEND_URL!/health
echo.
echo Login:
echo   Email: admin@emporio.com
echo   Senha: admin123
echo.
echo Administração:
echo   Railway: https://railway.app
echo   Vercel: https://vercel.com/dashboard
) > DEPLOY-INFO.txt

echo ✅ Informações salvas em: DEPLOY-INFO.txt
echo.
echo Acesse: !FRONTEND_URL!
echo.
pause
