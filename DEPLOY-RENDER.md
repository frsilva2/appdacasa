# Guia de Deploy - Render + Vercel

## 🎯 Visão Geral

Este guia explica como fazer o deploy do **Empório Tecidos Sistema** utilizando:
- **Backend**: Render (https://render.com)
- **Frontend**: Vercel (https://vercel.com)
- **Banco de Dados**: Render MySQL ou PlanetScale

---

## 🔧 Backend no Render

### 1. Criar Web Service

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório do GitHub
4. Configure:
   - **Name**: `emporio-tecidos-backend`
   - **Region**: Oregon (US West) ou outra próxima
   - **Branch**: `main` ou sua branch de produção
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou pago conforme necessário)

### 2. Configurar Variáveis de Ambiente

No painel do Render, vá em **"Environment"** e adicione:

#### ✅ Variáveis Obrigatórias

```bash
# Database (fornecido pelo Render MySQL ou PlanetScale)
DATABASE_URL=mysql://user:password@host:3306/database

# Ambiente
NODE_ENV=production
PORT=5000

# Frontend URL - IMPORTANTE para CORS!
# Coloque a URL do seu app no Vercel
FRONTEND_URL=https://seu-app.vercel.app

# JWT Secret - TROQUE por uma chave forte e única!
JWT_SECRET=sua-chave-secreta-forte-aqui-min-32-caracteres
JWT_EXPIRES_IN=7d

# Uploads
UPLOAD_PROVIDER=local
UPLOAD_DIR=./uploads

# OCR
OCR_PROVIDER=tesseract

# WhatsApp (opcional)
WHATSAPP_BASE_URL=https://wa.me/
DEFAULT_WHATSAPP_NUMBER=5531999999999

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
LOG_DIR=./logs
```

#### 🔑 CORS - Configuração Especial

A variável `FRONTEND_URL` é **CRÍTICA** para o funcionamento do login e autenticação.

**Opções de configuração:**

1. **URL única** (recomendado para produção):
   ```bash
   FRONTEND_URL=https://emporio-tecidos.vercel.app
   ```

2. **Múltiplas URLs** (útil para ambiente de staging + produção):
   ```bash
   FRONTEND_URL=https://emporio-tecidos.vercel.app,https://emporio-staging.vercel.app
   ```

3. **Wildcard automático**: O backend aceita automaticamente qualquer `*.vercel.app` e `*.netlify.app`, então você pode deixar em branco se usar apenas esses domínios.

### 3. Configurar Banco de Dados

#### Opção A: Render MySQL (Recomendado)

1. No Render, clique em **"New +"** → **"PostgreSQL"** ou **"MySQL"**
2. Copie a `Internal Database URL` ou `External Database URL`
3. Cole em `DATABASE_URL` nas variáveis de ambiente do backend

#### Opção B: PlanetScale

1. Crie um banco no [PlanetScale](https://planetscale.com/)
2. Copie a connection string
3. Adicione `?sslaccept=strict` no final da URL
4. Cole em `DATABASE_URL`

Exemplo:
```
DATABASE_URL=mysql://user:pass@aws.connect.psdb.cloud/db?sslaccept=strict
```

### 4. Executar Migrations

Após configurar o banco de dados:

1. No Render, vá em **"Shell"** (terminal do serviço)
2. Execute:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

Ou configure um **Deploy Hook** para rodar automaticamente:
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

### 5. Verificar Deploy

Acesse:
```
https://emporio-tecidos-backend.onrender.com/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-11-30T...",
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 🌐 Frontend no Vercel

### 1. Criar Projeto no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Configurar Variáveis de Ambiente

No Vercel, vá em **"Settings"** → **"Environment Variables"** e adicione:

```bash
# URL do backend no Render
VITE_API_URL=https://emporio-tecidos-backend.onrender.com/api
```

**IMPORTANTE**: Certifique-se de que esta URL corresponde ao domínio do seu backend no Render!

### 3. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada (ex: `https://emporio-tecidos.vercel.app`)

### 4. Configurar Domínio Customizado (Opcional)

1. No Vercel, vá em **"Settings"** → **"Domains"**
2. Adicione seu domínio customizado (ex: `app.emporiotecidos.com.br`)
3. Configure os DNS conforme instruções do Vercel
4. **IMPORTANTE**: Adicione o novo domínio na variável `FRONTEND_URL` do backend no Render!

---

## 🔄 Fluxo de Atualização

### Atualizar Backend

1. Faça push para o branch configurado no Render (ex: `main`)
2. O Render detecta automaticamente e faz redeploy
3. Se alterou o schema Prisma, execute migrations manualmente via Shell:
   ```bash
   npx prisma migrate deploy
   ```

### Atualizar Frontend

1. Faça push para o branch configurado no Vercel
2. O Vercel detecta automaticamente e faz redeploy
3. Não precisa de ação manual!

---

## 🐛 Troubleshooting

### Erro de CORS no Login

**Sintoma**: `No 'Access-Control-Allow-Origin' header is present`

**Solução**:
1. Verifique se a variável `FRONTEND_URL` no Render está correta
2. Certifique-se de incluir o protocolo (`https://`)
3. Não adicione barra no final (`/`)
4. Exemplo correto: `https://emporio-tecidos.vercel.app`
5. Faça redeploy do backend após alterar

### Erro 500 ao fazer login

**Sintoma**: Backend retorna erro 500

**Possíveis causas**:
1. **Banco de dados não conectado**: Verifique `DATABASE_URL`
2. **Migrations não executadas**: Execute `npx prisma migrate deploy`
3. **Sem dados no banco**: Execute `npx prisma db seed`

### Frontend não encontra o backend

**Sintoma**: `ERR_NAME_NOT_RESOLVED` ou `404`

**Solução**:
1. Verifique se `VITE_API_URL` no Vercel está correto
2. Teste o endpoint do backend diretamente: `https://SEU-BACKEND.onrender.com/health`
3. Certifique-se de que o backend está rodando (pode demorar 50s para "acordar" no plano Free)

### Assets (imagens de cores) não carregam

**Sintoma**: Imagens retornam 404

**Solução**:
1. Certifique-se de que os assets estão na pasta `backend/public/assets`
2. Ou configure `ASSETS_PATH` para apontar para Google Drive sync local
3. Para produção, recomenda-se hospedar assets em CDN (Cloudinary, AWS S3, etc.)

---

## 📊 Monitoramento

### Logs do Backend (Render)

1. Acesse o dashboard do Render
2. Selecione seu serviço
3. Clique em **"Logs"**
4. Filtre por erros (`error`) ou warnings (`warn`)

### Logs do Frontend (Vercel)

1. Acesse o dashboard do Vercel
2. Selecione seu projeto
3. Clique em **"Deployments"**
4. Clique no deployment específico para ver logs de build

---

## 🚀 Otimizações de Produção

### Backend

1. **Upgrade para plano pago**: Evita cold starts (plano Free "dorme" após 15min inativo)
2. **Configurar CDN para assets**: Cloudinary ou AWS S3
3. **Habilitar Redis**: Cache para consultas frequentes
4. **Health checks**: Configure pings periódicos para manter serviço acordado

### Frontend

1. **Domínio customizado**: Melhor SEO e branding
2. **Analytics**: Vercel Analytics para monitorar performance
3. **Preview Deployments**: Cada PR gera um deploy de preview automaticamente

---

## 📞 Suporte

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Última atualização**: 2025-11-30
**Autor**: Claude Code 🤖
