# 🧵 Empório Tecidos - Sistema de Gestão

Sistema integrado de gestão para rede de lojas de tecidos com 4 aplicações web responsivas (mobile-first).

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Técnica](#stack-técnica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Aplicações](#aplicações)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)
- [Credenciais Padrão](#credenciais-padrão)

## 🎯 Sobre o Projeto

Sistema completo de gestão para a rede Empório Tecidos, composto por:

1. **App 1**: Requisição de Abastecimento (Lojas → CD)
2. **App 2**: Requisição de Cotação (CD → Fornecedores)
3. **App 3**: Compra Programada B2B (Atacado)
4. **App 4**: Inventário/Almoxarifado (OCR, conferência, romaneio)
5. **Painel Admin**: Gestão completa do sistema

### Características

- ✅ Design mobile-first, intuitivo e acessível
- ✅ Interface simples para usuários 50+
- ✅ Autenticação JWT com diferentes tipos de usuário
- ✅ Sistema de priorização de lojas (G1 > Guaranis > Ipatinga > TO > CF)
- ✅ Curva ABC de produtos
- ✅ Notificações via WhatsApp
- ✅ OCR para conferência de etiquetas
- ✅ Comparação automática de preços
- ✅ PWA (funciona offline)

## 🛠️ Stack Técnica

### Frontend
- **React 18** com Vite
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **React Query** para gerenciamento de estado do servidor
- **React Hook Form + Zod** para formulários e validação
- **Axios** para requisições HTTP
- **Lucide React** para ícones

### Backend
- **Node.js + Express**
- **Prisma ORM** com MySQL
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Multer** para upload de arquivos
- **Tesseract.js** para OCR
- **Winston** para logging
- **Helmet** para segurança

### Banco de Dados
- **MySQL 8.0**

### DevOps
- **Docker** e **Docker Compose**
- **Git** para versionamento

## 📁 Estrutura do Projeto

```
emporio-tecidos-sistema/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas das aplicações
│   │   ├── services/        # Serviços de API
│   │   ├── contexts/        # Contexts do React
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilitários
│   ├── Dockerfile
│   └── package.json
│
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── routes/          # Rotas da API
│   │   ├── middlewares/     # Middlewares
│   │   ├── services/        # Lógica de negócio
│   │   ├── config/          # Configurações
│   │   └── utils/           # Utilitários
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   ├── database/
│   │   └── seeds/           # Seeds do banco
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml        # Orquestração de containers
├── .env.example             # Variáveis de ambiente de exemplo
└── README.md                # Este arquivo
```

## ⚙️ Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** e **Docker Compose** (opcional, mas recomendado)
- **MySQL** 8.0 (se não usar Docker)

## 🚀 Instalação

### Opção 1: Com Docker (Recomendado)

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd emporio-tecidos-sistema
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

3. **Inicie os containers**
```bash
docker-compose up -d
```

4. **Execute as migrations do banco**
```bash
# Entre no container do backend
docker-compose exec backend sh

# Execute as migrations
npm run prisma:migrate

# Execute o seed (dados iniciais)
npm run prisma:seed

# Saia do container
exit
```

5. **Acesse as aplicações**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Opção 2: Instalação Local

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd emporio-tecidos-sistema
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Configure as variáveis com seus dados
```

3. **Instale as dependências**
```bash
# Na raiz do projeto
npm install

# Ou instale em cada workspace
cd backend && npm install
cd ../frontend && npm install
```

4. **Configure o banco de dados MySQL**
```bash
# Crie um banco de dados
mysql -u root -p
CREATE DATABASE emporio_tecidos;
```

5. **Execute as migrations**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

6. **Inicie os servidores**
```bash
# Na raiz do projeto (em dois terminais diferentes)

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

7. **Acesse as aplicações**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📱 Como Usar

### 1. Login no Sistema

Acesse http://localhost:5173 e faça login com as credenciais padrão:

**Administrador:**
- Email: `admin@emporiotecidos.com.br`
- Senha: `emporio123`

**Gerente Loja G1:**
- Email: `gerente.g1@emporiotecidos.com.br`
- Senha: `emporio123`

**Usuário CD:**
- Email: `cd1@emporiotecidos.com.br`
- Senha: `emporio123`

### 2. Navegação

O sistema possui diferentes interfaces conforme o tipo de usuário:

- **ADMIN**: Acesso total ao sistema
- **GERENTE_LOJA**: Criar e acompanhar requisições de abastecimento
- **USUARIO_CD**: Aprovar requisições, criar cotações, gerenciar estoque
- **OPERADOR**: Gerenciar pedidos B2B
- **CLIENTE_B2B**: Fazer pedidos atacado
- **FORNECEDOR**: Responder cotações via link público

## 🎨 Aplicações

### App 1: Requisição de Abastecimento
**Usuários**: Gerentes de Loja e Usuários CD

**Funcionalidades:**
- Criar requisição selecionando produtos/cores/quantidades
- Visualizar status (Pendente, Aprovada, Recusada, Atendida)
- Histórico de requisições
- Notificações WhatsApp

**Fluxo:**
1. Gerente cria requisição
2. CD aprova/recusa (total ou parcial)
3. CD separa produtos e gera romaneio
4. Produtos são enviados para loja

### App 2: Requisição de Cotação
**Usuários**: Usuários CD e Fornecedores (link público)

**Funcionalidades:**
- Criar cotação manual ou automática
- Enviar para fornecedores
- Comparação automática de preços
- Análise de variação vs histórico
- Aprovação de compra

**Fluxo:**
1. CD cria cotação
2. Fornecedores recebem link e respondem
3. Sistema compara preços automaticamente
4. Gerente de compras aprova melhor opção

### App 3: Compra Programada B2B
**Usuários**: Clientes B2B e Operadores

**Funcionalidades:**
- Cadastro de cliente PJ (CNPJ/IE MG)
- Pedido mínimo R$ 500 + 60m por categoria/cor
- Frete grátis
- Pagamento 4x sem juros / PIX / Dinheiro
- Prazo entrega: 15 dias

**Fluxo:**
1. Cliente se cadastra
2. Aguarda aprovação
3. Faz pedido
4. Operador aprova e envia link de pagamento
5. Após pagamento, pedido entra em produção
6. Cliente acompanha status até entrega

### App 4: Inventário/Almoxarifado
**Usuários**: Usuários CD

**Funcionalidades:**
- Conferência de recebimento (upload XML + fotos)
- OCR de etiquetas
- Base DEPARA para unificar nomes
- Inventário por setor
- Geração de romaneio

**Fluxo Conferência:**
1. Upload XML da nota fiscal
2. Tirar fotos das etiquetas
3. OCR extrai dados
4. Sistema compara nota vs físico
5. Registra divergências
6. Confirma recebimento

### Painel Admin
**Usuários**: Admin

**Funcionalidades:**
- CRUD de usuários, lojas, produtos, cores
- Gestão de estoque
- Aprovações centralizadas
- Dashboards e relatórios
- Logs de auditoria

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/login           # Login
GET    /api/auth/me              # Dados do usuário logado
POST   /api/auth/change-password # Alterar senha
POST   /api/auth/reset-password  # Resetar senha (admin)
```

### Usuários
```
GET    /api/users           # Listar usuários
GET    /api/users/:id       # Buscar usuário
POST   /api/users           # Criar usuário
PUT    /api/users/:id       # Atualizar usuário
DELETE /api/users/:id       # Deletar usuário
PATCH  /api/users/:id/toggle-active # Ativar/desativar
```

### Lojas
```
GET    /api/lojas           # Listar lojas
GET    /api/lojas/:id       # Buscar loja
POST   /api/lojas           # Criar loja (admin)
PUT    /api/lojas/:id       # Atualizar loja (admin)
DELETE /api/lojas/:id       # Deletar loja (admin)
```

### Produtos
```
GET    /api/produtos        # Em desenvolvimento
```

### Requisições de Abastecimento
```
GET    /api/requisicoes-abastecimento    # Em desenvolvimento
```

### Cotações
```
GET    /api/cotacoes        # Em desenvolvimento
```

### Pedidos B2B
```
GET    /api/pedidos-b2b     # Em desenvolvimento
```

### Inventário
```
GET    /api/inventario      # Em desenvolvimento
```

### Dashboard
```
GET    /api/dashboard       # Em desenvolvimento
```

## 🚀 Deploy

### Sugestões de Hospedagem (até R$ 300/mês)

#### Opção 1: Railway (Recomendado)
- **Preço**: ~$20/mês (~R$100)
- **Vantagens**: Deploy automático, PostgreSQL/MySQL incluído, fácil configuração
- **Passos**:
  1. Conecte seu repositório Git
  2. Configure as variáveis de ambiente
  3. Deploy automático a cada push

#### Opção 2: Render
- **Preço**: ~$25/mês (~R$125)
- **Vantagens**: Free tier generoso, SSL automático
- **Passos**:
  1. Crie um Web Service para o backend
  2. Crie um Static Site para o frontend
  3. Configure PostgreSQL/MySQL

#### Opção 3: VPS (DigitalOcean/Linode)
- **Preço**: $12-24/mês (~R$60-120)
- **Vantagens**: Controle total, melhor performance
- **Requisitos**: Conhecimento em Linux/DevOps

### Configuração para Produção

1. **Configure variáveis de ambiente de produção**
```bash
NODE_ENV=production
DATABASE_URL=<mysql-production-url>
JWT_SECRET=<generate-strong-secret>
FRONTEND_URL=<your-frontend-domain>
```

2. **Build do frontend**
```bash
cd frontend
npm run build
```

3. **Configure servidor web (Nginx)**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Configure SSL com Let's Encrypt**
```bash
sudo certbot --nginx -d seu-dominio.com
```

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ Proteção XSS
- ✅ Proteção SQL Injection (Prisma)
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Logs de auditoria

## 🎨 Identidade Visual

**Cores:**
- Rosa: `#EE2B68`
- Azul: `#2F3685`
- Rosa Claro: `#FFDCEA`

**Design:**
- Mobile-first
- Botões grandes
- Fontes legíveis
- Interface intuitiva

## 👤 Credenciais Padrão

Após executar o seed, os seguintes usuários estarão disponíveis:

| Tipo | Email | Senha | Loja |
|------|-------|-------|------|
| Admin | admin@emporiotecidos.com.br | emporio123 | - |
| Gerente Loja | gerente.g1@emporiotecidos.com.br | emporio123 | G1 |
| Gerente Loja | gerente.guaranis@emporiotecidos.com.br | emporio123 | Guaranis |
| Usuário CD | cd1@emporiotecidos.com.br | emporio123 | - |
| Usuário CD | cd2@emporiotecidos.com.br | emporio123 | - |
| Operador | operador@emporiotecidos.com.br | emporio123 | - |

**⚠️ IMPORTANTE**: Altere todas as senhas padrão em produção!

## 📊 Dados Iniciais

O seed cria automaticamente:
- ✅ 5 Lojas (G1, Guaranis, Ipatinga, TO, CF)
- ✅ 6 Usuários padrão
- ✅ 5 Fornecedores
- ✅ 48 Produtos principais
- ✅ 12 Cores básicas
- ✅ Estoque inicial no CD
- ✅ Configurações do sistema

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev                    # Inicia ambos (frontend + backend)
npm run dev:frontend           # Apenas frontend
npm run dev:backend            # Apenas backend

# Docker
npm run docker:up              # Sobe containers
npm run docker:down            # Para containers
npm run docker:logs            # Ver logs

# Prisma
npm run prisma:generate        # Gera Prisma Client
npm run prisma:migrate         # Executa migrations
npm run prisma:seed            # Executa seed
npm run prisma:studio          # Abre Prisma Studio

# Build
npm run build                  # Build de produção
```

## 📝 Logs

Os logs são armazenados em:
- **Backend**: `backend/logs/`
  - `combined.log` - Todos os logs
  - `error.log` - Apenas erros

## 🐛 Troubleshooting

### Erro de conexão com o banco
```bash
# Verifique se o MySQL está rodando
docker-compose ps

# Verifique a string de conexão no .env
DATABASE_URL="mysql://user:pass@localhost:3306/database"
```

### Erro de permissão no Prisma
```bash
# Regenere o Prisma Client
npm run prisma:generate
```

### Frontend não conecta na API
```bash
# Verifique a variável VITE_API_URL no .env
VITE_API_URL=http://localhost:5000/api
```

## 📧 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

UNLICENSED - Uso interno exclusivo do Empório Tecidos.

---

**Desenvolvido com ❤️ para Empório Tecidos**
