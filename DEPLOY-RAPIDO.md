# 🚀 Deploy Rápido - 5 Minutos

## ✅ Pré-requisitos
- Conta no Railway (login com GitHub)
- Repositório no GitHub

---

## 📦 BACKEND (Railway) - 3 passos

### 1. Criar Projeto
1. Vá em https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Selecione: `basic` (seu repositório)

### 2. Configurar Pasta
No serviço criado:
- **Settings** → **Root Directory**: `backend`
- Salvar

### 3. Adicionar MySQL
No dashboard do projeto:
- **+ New** → **Database** → **Add MySQL**
- Aguarde ficar "Active"

### 4. Adicionar Variáveis (copie/cole)
No serviço backend → **Variables** → adicione:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=emporio-tecidos-2025-producao-chave-super-segura-trocar
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
FRONTEND_URL=https://temporary.vercel.app
```

**DATABASE_URL** já foi criada automaticamente pelo MySQL!

### 5. Deploy
- Aguarde o deploy terminar
- Copie a URL: `https://seu-backend.up.railway.app`

---

## 🎨 FRONTEND (Vercel) - 2 passos

### 1. Criar Projeto
1. Vá em https://vercel.com
2. **New Project** → **Import Git Repository**
3. Selecione: `basic`

### 2. Configurar
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Adicionar Variável
Em **Environment Variables**:

```
VITE_API_URL=https://seu-backend.up.railway.app/api
```

(Use a URL do Railway que você copiou)

### 4. Deploy
- Clique em **Deploy**
- Copie a URL: `https://seu-app.vercel.app`

---

## 🔗 Conectar Frontend ↔ Backend

Volte no **Railway**:
- Backend → **Variables** → Edite `FRONTEND_URL`
- Cole: `https://seu-app.vercel.app`
- Salvar (vai fazer redeploy automático)

---

## 🎉 PRONTO!

Acesse: `https://seu-app.vercel.app`

Login padrão:
- Email: `admin@emporio.com`
- Senha: `admin123`

---

## 🐛 Problemas?

**Erro no Railway**: Veja logs em **Deployments** → Clique no deploy → **View Logs**

**Erro no Vercel**: Veja logs em **Deployments** → Clique no deploy → **Function Logs**

**CORS Error**: Verifique se `FRONTEND_URL` no Railway está correto
