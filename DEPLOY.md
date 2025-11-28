# 🚀 Guia Rápido de Deploy

## 📦 Repositório GitHub
✅ **Repositório**: https://github.com/frsilva2/appdacasa

---

## 🔧 PASSO 1: Deploy do Backend (Render)

### 1. Acesse o Render
- Vá para: https://render.com/
- Faça login ou crie uma conta (gratuita)

### 2. Criar Web Service
1. Clique em **"New +"** → **"Web Service"**
2. Conecte ao GitHub (autorize se necessário)
3. Selecione o repositório: **appdacasa**
4. Configure:
   - **Name**: `emporio-tecidos-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3. Adicionar Banco de Dados MySQL
1. No dashboard do Render, clique em **"New +"** → **"MySQL"**
2. Configure:
   - **Name**: `emporio-tecidos-db`
   - **Database**: `emporio_tecidos`
   - **User**: `emporio`
   - **Region**: Oregon (US West)
   - **Plan**: Free (500MB)

3. Copie a **Internal Connection String** (formato: `mysql://user:pass@host:port/db`)

### 4. Configurar Variáveis de Ambiente
No Web Service do backend, vá em **"Environment"** e adicione:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<cole-a-connection-string-do-mysql>
JWT_SECRET=emporio-tecidos-super-secret-key-2025-change-me
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
DEFAULT_WHATSAPP_NUMBER=5531999999999
FRONTEND_URL=https://seu-app.vercel.app
```

⚠️ **IMPORTANTE**: Altere `JWT_SECRET` para uma chave segura e única!

### 5. Rodar Migrations
1. No dashboard do backend, vá em **"Shell"**
2. Execute: `npx prisma migrate deploy`

### 6. Obter URL do Backend
- Após o deploy, copie a URL (exemplo: `https://emporio-tecidos-backend.onrender.com`)
- Você vai precisar dessa URL no próximo passo!

---

## 🌐 PASSO 2: Deploy do Frontend (Vercel)

### 1. Atualizar URL do Backend
No arquivo `frontend/.env.production`, atualize:
```
VITE_API_URL=https://sua-url-do-render.onrender.com/api
```

Faça commit e push:
```bash
git add frontend/.env.production
git commit -m "Atualizar URL da API"
git push
```

### 2. Deploy no Vercel
No terminal, execute:
```bash
cd C:\Projetos\app\frontend
vercel --prod
```

OU use a interface web:
1. Acesse: https://vercel.com/
2. Clique em **"Add New"** → **"Project"**
3. Importe: **appdacasa**
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://sua-url-do-render.onrender.com/api
     ```

### 3. Atualizar CORS no Backend
1. Copie a URL do Vercel (exemplo: `https://appdacasa.vercel.app`)
2. No Render, atualize a variável `FRONTEND_URL` com essa URL
3. O Render vai fazer redeploy automaticamente

---

## ✅ PASSO 3: Testar o Sistema

### Teste o Backend
Acesse: `https://sua-url-do-render.onrender.com/api/health`

Deve retornar:
```json
{"status": "ok", "timestamp": "..."}
```

### Teste o Frontend
1. Acesse: `https://seu-app.vercel.app`
2. Tente fazer login ou acessar a loja B2B

### Criar Usuário Admin
Se precisar criar o primeiro usuário admin:

**Opção 1 - Via Shell do Render:**
```bash
# No Shell do Render (backend)
node src/scripts/create-admin.js
```

**Opção 2 - Direto no banco:**
Use um cliente MySQL (TablePlus, DBeaver, etc.) e conecte com as credenciais do Render, depois execute:

```sql
INSERT INTO User (id, nome, email, senha, tipo, ativo, createdAt, updatedAt)
VALUES (
  'admin-001',
  'Administrador',
  'admin@emporio.com',
  '$2a$10$xQg3qN4z0FvQgQ3r0FvQgOy0FvQgQ3r0FvQgQ3r0FvQgQ3r0FvQgQ',
  'ADMIN',
  1,
  NOW(),
  NOW()
);
```
Senha: `admin123`

---

## 🔄 Atualizações Futuras

Sempre que fizer mudanças no código:

```bash
# Fazer commit
git add .
git commit -m "Descrição da mudança"
git push

# Render e Vercel fazem deploy automático!
```

---

## 📊 URLs Finais

Depois do deploy, anote suas URLs:

- 🔧 **Backend (Render)**: `https://emporio-tecidos-backend.onrender.com`
- 🌐 **Frontend (Vercel)**: `https://appdacasa.vercel.app`
- 🗄️ **Banco de Dados**: Via dashboard do Render

---

## 💡 Dicas

1. **Free Tier do Render**: O serviço "dorme" após 15min de inatividade. Primeira requisição pode demorar ~30s
2. **Vercel**: Deploy instantâneo e sempre ativo
3. **Logs**: Acesse os logs em tempo real no dashboard do Render
4. **Domínio Customizado**: Configure em Settings de cada serviço

---

## 🆘 Problemas Comuns

### Erro: "Cannot connect to database"
- Verifique se `DATABASE_URL` está correto no Render
- Certifique-se de que o MySQL está rodando

### Erro: "CORS policy"
- Verifique se `FRONTEND_URL` aponta para o Vercel correto
- URL deve ser exata (sem barra no final)

### Migrations não aplicadas
- No Shell do Render: `npx prisma migrate deploy`

---

🎉 **Pronto! Seu app está online!**
