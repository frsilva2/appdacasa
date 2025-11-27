# 🚀 Deploy Automático - Guia Completo

## ✅ CLIs Já Instalados

- ✅ Railway CLI v4.11.2
- ✅ Vercel CLI v48.11.1

---

## 🎯 Opção 1: Script Automático Completo (RECOMENDADO)

Execute **UM ÚNICO script** que faz tudo:

### Windows:
```cmd
deploy-completo.bat
```

### Linux/Mac:
```bash
chmod +x deploy-completo.sh
./deploy-completo.sh
```

**O que o script faz:**
1. ✅ Login no Railway (abre navegador)
2. ✅ Cria projeto + adiciona MySQL automaticamente
3. ✅ Configura todas as variáveis de ambiente
4. ✅ Faz deploy do backend
5. ✅ Login no Vercel (abre navegador)
6. ✅ Faz deploy do frontend
7. ✅ Conecta frontend ↔ backend automaticamente
8. ✅ Salva todas URLs em `DEPLOY-INFO.txt`

**Tempo total: ~5-7 minutos**

---

## 🎯 Opção 2: Deploy Manual por Partes

Se preferir fazer passo a passo:

### 1. Backend (Railway):
```bash
# Windows
deploy-railway.bat

# Linux/Mac
chmod +x deploy-railway.sh
./deploy-railway.sh
```

### 2. Frontend (Vercel):
```bash
# Windows
deploy-vercel.bat

# Linux/Mac
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

---

## 📋 O que acontece durante o deploy

### Backend (Railway)

**Login:**
- Navegador abre automaticamente
- Faça login com GitHub
- Autorize o Railway CLI

**Deploy:**
- Cria projeto `emporio-tecidos-backend`
- Adiciona banco MySQL automaticamente
- Configura variáveis:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `JWT_SECRET` (gerado automaticamente)
  - `DATABASE_URL` (gerado pelo MySQL)
  - E mais...
- Roda migrations do Prisma
- Deploy automático

**Resultado:**
```
Backend URL: https://emporio-tecidos-backend-production-xxx.up.railway.app
API: https://emporio-tecidos-backend-production-xxx.up.railway.app/api
```

---

### Frontend (Vercel)

**Login:**
- Navegador abre automaticamente
- Faça login com GitHub/GitLab/Bitbucket
- Autorize o Vercel CLI

**Deploy:**
- Detecta projeto Vite automaticamente
- Cria `.env.production` com URL do backend
- Build otimizado para produção
- Deploy em CDN global
- Conecta com backend (atualiza CORS)

**Resultado:**
```
Frontend URL: https://emporio-tecidos.vercel.app
```

---

## 🎉 Após o Deploy

As URLs ficarão salvas em **`DEPLOY-INFO.txt`**:

```
Frontend: https://seu-app.vercel.app
Backend: https://seu-backend.up.railway.app/api
Health Check: https://seu-backend.up.railway.app/health
```

### Testar Backend:

```bash
# Health check
curl https://seu-backend.up.railway.app/health

# Login test
curl -X POST https://seu-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@emporio.com","senha":"admin123"}'
```

### Acessar Frontend:

Abra: `https://seu-app.vercel.app`

**Login padrão:**
- Email: `admin@emporio.com`
- Senha: `admin123`

---

## 🔧 Troubleshooting

### Erro: "Cannot login in non-interactive mode"

**Solução:** Execute o script `.bat` (Windows) ou `.sh` (Linux/Mac) diretamente no terminal.

### Erro: "railway: command not found"

**Solução:** Railway CLI não instalado corretamente:
```bash
npm install -g @railway/cli
```

### Erro: "vercel: command not found"

**Solução:** Vercel CLI não instalado corretamente:
```bash
npm install -g vercel
```

### Erro: "CORS blocked" no frontend

**Solução:** Verifique se o `FRONTEND_URL` no Railway está correto:
```bash
cd backend
railway variables
railway variables set FRONTEND_URL=https://sua-url-correta.vercel.app
```

### MySQL não foi criado

**Solução:** Adicione manualmente no Railway:
1. Dashboard do projeto
2. **+ New** → **Database** → **Add MySQL**
3. Aguarde ficar "Active"

---

## 🔄 Atualizar Deploy

Após fazer mudanças no código:

```bash
# Commit as mudanças
git add .
git commit -m "sua mensagem"
git push origin main

# Railway e Vercel fazem redeploy AUTOMÁTICO!
```

Ambos detectam push no GitHub e fazem redeploy automaticamente.

---

## 🗄️ Acessar Banco de Dados

### Via Railway Dashboard:

1. https://railway.app
2. Seu projeto → MySQL
3. **Connect** → Veja credenciais

### Via Prisma Studio (localmente):

```bash
cd backend

# Copiar DATABASE_URL do Railway
railway variables get DATABASE_URL

# Adicionar no .env local
echo "DATABASE_URL=<url-copiada>" > .env

# Abrir Prisma Studio
npx prisma studio
```

Abre em: http://localhost:5555

---

## 💰 Custos

### Opção Gratuita (Limitações):
- **Railway:** $5 grátis/mês (±500h)
- **Vercel:** Ilimitado (com limites de bandwidth)
- **Total:** Grátis para testes

### Produção Recomendada:
- **Railway Hobby:** $5/mês (backend + MySQL)
- **Vercel Pro:** $20/mês (CDN, analytics, domínio)
- **Total:** ~R$ 125/mês

---

## 📞 Suporte

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://prisma.io/docs

---

## 🎊 Pronto!

Seu sistema está no ar! 🚀

Qualquer problema, confira os logs:
- **Railway:** Dashboard → Deployments → View Logs
- **Vercel:** Dashboard → Deployments → Function Logs
