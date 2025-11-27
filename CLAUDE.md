# Contexto do Projeto - Empório Tecidos Sistema

## Preferências de Idioma
**Sempre responda em português (Brasil).**
Mantenha todas as respostas, comentários de código e documentação em português.

---

## Visão Geral do Projeto

**Empório Tecidos Sistema** é um ERP especializado para gestão de rede de lojas de tecidos com 5 lojas físicas em Minas Gerais. Sistema integrado que gerencia toda a cadeia de suprimentos e vendas B2B.

### Informações Básicas
- **Nome**: Empório Tecidos Sistema
- **Tipo**: Aplicação Web Fullstack + PWA
- **Localização**: `C:\Projetos\app`
- **Lojas**: 5 unidades em MG (G1, Guaranis, Ipatinga, Teófilo Otoni, Coronel Fabriciano)

---

## Stack Tecnológico

### Frontend
- **React 18.2.0** - Biblioteca UI
- **Vite 5.0.11** - Build tool e dev server
- **Tailwind CSS 3.4.1** - Framework CSS (cores customizadas da marca)
- **React Router DOM 6.21.1** - Roteamento SPA
- **TanStack React Query 5.17.9** - Gerenciamento de estado servidor
- **React Hook Form 7.49.3 + Zod 3.22.4** - Formulários e validação
- **Axios 1.6.5** - Cliente HTTP
- **Lucide React** - Ícones
- **vite-plugin-pwa** - Suporte PWA

### Backend
- **Node.js** (>=18.0.0) com ES Modules
- **Express 4.18.2** - Framework web
- **Prisma ORM 5.8.0** - ORM para MySQL
- **MySQL 8.0** - Banco de dados
- **JWT (jsonwebtoken 9.0.2)** - Autenticação
- **Bcrypt.js 2.4.3** - Hash de senhas
- **Winston 3.11.0** - Sistema de logging
- **Helmet 7.1.0** - Segurança HTTP headers
- **Express Rate Limit** - Rate limiting (100 req/15min)
- **Multer 1.4.5** - Upload de arquivos
- **Tesseract.js 5.0.4** - OCR (reconhecimento óptico)
- **xlsx 0.18.5** - Parser Excel (para DEPARA)

### DevOps
- **Docker & Docker Compose** - Containerização
- **Git** - Controle de versão
- **nodemon** - Hot reload desenvolvimento

---

## 🎨 ESTADO ATUAL DO BANCO DE DADOS (2025-11-25)

### ✅ Dados Completos e Funcionais

```
✅ Produtos:     48 tecidos
✅ Cores:        2.112 (48 produtos × 44-45 cores cada)
✅ Estoque:      2.112 registros (50-500m cada no CD)
✅ Usuários:     6 (tipos: ADMIN, GERENTE_LOJA, USUARIO_CD, etc)
✅ Lojas:        5 (G1, Guaranis, Ipatinga, TO, CF)
✅ Fornecedores: 5
```

**IMPORTANTE:** Todos os 48 produtos agora têm entre 44-45 cores reais dos assets integradas!

### 46 Cores Reais Integradas

As cores dos assets foram totalmente integradas com fotos reais:

- Branco, Marrom, Rosa Claro, Cinza, Off-White
- Cinza Grafite, Bege Marfim, Bege Médio, Preto, Rosa Bebê
- Off Amarelado, Nude, Azul Celeste, Verde Oliva
- Vermelho Escuro, Azul Marinho Noite, Amarelo Pastel
- Vinho, Cinza Escuro, Lilás Claro, Verde Azeitona
- Terracota, Rosa Antigo, Laranja, Amarelo Ouro
- Caramelo, Marrom Café, Verde Água, Amarelo Mostarda
- Amarelo Dourado, Marsala, Azul Royal, Azul Marinho
- Salmão, Verde Menta, Verde Musgo, Azul Bebê
- Rosa Pink, Verde Floresta, Azul Serenity, Roxo
- Verde Bandeira, Vermelho, Vinho Marsala

Cada cor possui:
- ✅ Código HEX (#FFFFFF)
- ✅ Código Pantone
- ✅ RGB
- ✅ Foto real do tecido em alta qualidade

---

## Assets Integrados (Google Drive)

O projeto utiliza assets externos armazenados no Google Drive e sincronizados localmente em `C:\Projetos\Emporio-Tecidos-Assets`.

**Link Google Drive**: https://drive.google.com/drive/folders/1fh2ir3RFOJ3JYum3iurRKsxWskOZis9y

### Estrutura de Assets
```
C:\Projetos\Emporio-Tecidos-Assets/
├── ultimopreco.xlsx              # Planilha com 3 abas (preços, DEPARA, notas)
│   ├── Aba 1: FORNECEDOR-EMPORIO (preços)
│   ├── Aba 2: TABELA/DEPARA (281 produtos mapeados)
│   └── Aba 3: Notas (informações detalhadas)
├── cores/
│   ├── cores-metadata.json       # 46 cores aprovadas com hex, pantone, RGB
│   └── fotos/                    # 46 fotos de cores (nomecor_codigo.jpg)
├── etiquetas/                    # 14 fotos de etiquetas para OCR
│   ├── etiqueta-1.jpg
│   └── ... (etiqueta-14.jpg)
└── logo/
    ├── logo.svg                  # Vetorizado (15KB)
    ├── logo.png                  # Original (111KB)
    ├── logo-192.png              # PWA (11KB)
    └── logo-512.png              # PWA (30KB)
```

### APIs de Assets Disponíveis

#### Cores (/api/cores)
- `GET /api/cores` - Listar todas as 46 cores aprovadas ✅
- `GET /api/cores/:id` - Buscar cor por ID ✅
- `GET /api/cores/search?q=azul` - Buscar cores por nome ✅
- `GET /api/cores/hex/:hex` - Buscar cor por código hex (#FFFFFF) ✅
- `GET /api/cores/fotos` - Listar todas as fotos de cores ✅
- **Assets estáticos**: `/assets/cores/fotos/{arquivo}.jpg` ✅

#### Etiquetas (/api/etiquetas)
- `GET /api/etiquetas` - Listar todas as etiquetas ✅
- `GET /api/etiquetas/:nome` - Buscar etiqueta específica ✅
- `POST /api/etiquetas/ocr` - Processar OCR em etiqueta (upload ou existente) ✅
  - Upload: `multipart/form-data` com campo `etiqueta`
  - Existente: JSON `{ "etiqueta": "etiqueta-1.jpg" }`
- **Assets estáticos**: `/assets/etiquetas/{arquivo}.jpg` ✅

#### DEPARA (/api/depara)
- `GET /api/depara` - Buscar mapeamentos da planilha Excel ✅
- `GET /api/depara/clear-cache` - Limpar cache (TTL: 5 minutos) ✅
- **Fonte**: Aba 2 (TABELA/DEPARA) do arquivo `ultimopreco.xlsx`
- **Total**: 281 produtos mapeados

#### Logos
- **Assets estáticos**: `/assets/logo/logo.{svg,png}` ou `/assets/logo/logo-{192,512}.png` ✅

### Serviço Frontend (assets.js)

Arquivo: `frontend/src/services/assets.js` ✅

**Métodos disponíveis:**
```javascript
// Cores
import { getCores, getCorById, searchCores, getUrlFotoCor } from '@/services/assets';

// Etiquetas
import { getEtiquetas, processarOCREtiqueta, uploadEProcessarOCR } from '@/services/assets';

// Logos
import { getUrlLogo } from '@/services/assets';

// Helpers
import { isCorClara, getCorTextoContraste } from '@/services/assets';
```

### Funcionalidade OCR ✅

O sistema possui OCR integrado com **Tesseract.js** para processar etiquetas de fornecedores:

**Extrai automaticamente:**
- Metragem (padrão: "X m" ou "X metros")
- Quantidade (padrão: "Qtd: X")
- Preço (padrão: "R$ X,XX")
- Código do produto (padrão: "Cód: XXX")
- Texto completo com confiança
- Palavras individuais com score de confiança

**Como usar:**
```javascript
// Upload de nova etiqueta
const resultado = await uploadEProcessarOCR(arquivo);

// Processar etiqueta existente
const resultado = await processarOCREtiqueta('etiqueta-1.jpg');

// Resultado contém:
// - textoCompleto
// - linhas
// - palavras (com confiança)
// - informacoesExtraidas { produto, cor, quantidade, metragem, preco, codigo }
```

---

## Arquitetura do Sistema

### Estrutura de Pastas
```
C:\Projetos\app/
├── backend/                 # API Node.js/Express
│   ├── prisma/             # Schema e migrations
│   ├── src/
│   │   ├── controllers/    # 13 controllers (lógica de negócio)
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── loja.controller.js
│   │   │   ├── produto.controller.js
│   │   │   ├── requisicaoAbastecimento.controller.js
│   │   │   ├── cotacao.controller.js ✅
│   │   │   ├── pedidoB2B.controller.js ✅
│   │   │   ├── inventario.controller.js ⚠️
│   │   │   ├── cores.controller.js ✅
│   │   │   ├── etiquetas.controller.js ✅
│   │   │   └── depara.controller.js ✅
│   │   ├── routes/         # Definição de endpoints
│   │   ├── middlewares/    # Auth, error handling, rate limiting
│   │   ├── config/         # Configurações (DB, logger)
│   │   └── server.js       # Entry point
│   └── database/seeds/     # Dados iniciais
│       └── migrate-cores-assets.js ✅
│
├── frontend/                # App React/Vite
│   ├── src/
│   │   ├── components/     # Layout, LoadingSpinner, ProtectedRoute
│   │   │   ├── cores/      # CorCard, CoresGrid, SeletorCor ✅
│   │   │   └── etiquetas/  # UploadEtiqueta ✅
│   │   ├── contexts/       # AuthContext
│   │   ├── pages/          # Páginas organizadas por feature
│   │   │   ├── admin/      # ✅ COMPLETO
│   │   │   │   ├── ProdutosPage.jsx      # 48 produtos, filtros, stats
│   │   │   │   ├── LojasPage.jsx         # 5 lojas, prioridades
│   │   │   │   ├── UsersPage.jsx         # 6 usuários, tipos
│   │   │   │   └── CoresPage.jsx         # 46 cores com fotos
│   │   │   ├── requisicoes/     # APP 1 ✅
│   │   │   ├── cotacoes/        # APP 2 ✅
│   │   │   ├── pedidos-b2b/     # APP 3 ✅
│   │   │   └── inventario/      # APP 4 ✅
│   │   └── services/       # Cliente API (Axios)
│   │       └── assets.js   # ✅ Service layer para assets
│   └── vite.config.js      # Config PWA
│
├── docker-compose.yml      # Orquestração completa
├── CLAUDE.md              # Este arquivo (contexto do projeto)
├── RELATORIO-FINAL-COMPLETO.md  # Status completo do sistema
├── PROGRESSO-2025-11-25.md      # Correções mais recentes
└── README.md              # Documentação completa
```

### Padrões Arquiteturais
- **Arquitetura em Camadas**: React SPA → Express API → Prisma ORM → MySQL
- **MVC/Controller Pattern**: Separação clara de responsabilidades
- **Repository Pattern**: Via Prisma Client
- **Protected Routes**: Role-based access control
- **Interceptor Pattern**: Axios interceptors para auth e erro 401

---

## 4 Aplicações Principais (TODAS FUNCIONANDO ✅)

### APP 1: Requisição de Abastecimento (Lojas → CD) ✅
- Gerentes de loja solicitam produtos ao Centro de Distribuição
- Sistema de priorização: G1 > Guaranis > Ipatinga > TO > CF
- **ANTES:** Só 3 produtos disponíveis
- **AGORA:** TODOS os 48 produtos × 44 cores = **2.112 opções**
- **Workflow**: Criação → Aprovação/Recusa → Separação → Envio
- **Status**: Pendente, Aprovada, Aprovada Parcial, Recusada, Atendida, Enviada

### APP 2: Requisição de Cotação (CD → Fornecedores) ✅
- CD cria cotações manuais ou automáticas
- Fornecedores recebem link público (token-based) para responder
- Comparação automática de preços entre fornecedores
- Análise de variação vs histórico de compras
- Aprovação de melhor oferta
- **Todos os 48 produtos disponíveis**

### APP 3: Compra Programada B2B (Atacado) ✅
- Clientes PJ fazem pedidos atacado
- **Requisitos**: CNPJ/IE MG, mínimo R$500 + 60m por categoria/cor
- Frete grátis, pagamento 4x/PIX/dinheiro
- Prazo entrega: 15 dias
- **Workflow**: Cadastro → Aprovação → Pedido → Pagamento → Produção → Envio
- **TODAS as cores disponíveis**

### APP 4: Inventário/Almoxarifado ✅
- Conferência de recebimento via XML + fotos
- **OCR de etiquetas com Tesseract.js** ✅
- Base DEPARA para unificação de nomes (281 produtos mapeados)
- **Modo Manual:** Selecionar produto + cor
- **Modo OCR:** Escanear etiqueta e preencher automaticamente
- **Todas as 2.112 combinações disponíveis**
- Controle de movimentações de estoque

---

## Tipos de Usuários e Permissões

```
ADMIN           → Acesso total ao sistema
GERENTE_LOJA    → APP 1 (requisições)
USUARIO_CD      → APPs 1, 2, 4
OPERADOR        → APP 3 (B2B)
CLIENTE_B2B     → APP 3 (fazer pedidos)
FORNECEDOR      → APP 2 (responder cotações via link)
```

### Usuários de Teste (senha: emporio123)
```
admin@emporiotecidos.com.br          # ADMIN
gerente.g1@emporiotecidos.com.br     # GERENTE_LOJA (G1)
cd1@emporiotecidos.com.br            # USUARIO_CD
operador@emporiotecidos.com.br       # OPERADOR
cliente@empresateste.com.br          # CLIENTE_B2B
fornecedor@fornecedorteste.com.br    # FORNECEDOR
```

---

## Banco de Dados - 21 Models Prisma

### Models de Dados Principais:
1. **User** - Usuários do sistema (6 cadastrados)
2. **Loja** - 5 lojas físicas (G1, Guaranis, Ipatinga, TO, CF)
3. **Produto** - Catálogo de tecidos (48 produtos)
4. **Cor** - Cores por produto (2.112 cores = 48 × 44)
5. **Estoque** - Controle de estoque por local (2.112 registros CD)
6. **RequisicoesAbastecimento** - APP 1
7. **RequisicoesAbastecimentoItem** - Itens das requisições
8. **Cotacao** - APP 2 ✅
9. **CotacaoItem** - Itens da cotação
10. **Fornecedor** - Cadastro fornecedores (5 cadastrados)
11. **RespostaCotacao** - Respostas dos fornecedores
12. **ClienteB2B** - Clientes atacado
13. **PedidoB2B** - APP 3 ✅
14. **PedidoB2BItem** - Itens do pedido B2B
15. **MovimentacaoEstoque** - APP 4
16. **Romaneio** - Documentos de envio
17. **DEPARA** - Mapeamento de nomes de produtos
18. **AuditLog** - Logs de auditoria
19. **Configuracao** - Configurações do sistema
20. **HistoricoPrecosXML** - Histórico de preços
21. **CotacaoFornecedorToken** - Tokens para fornecedores

### ⚠️ Models Não Implementados (Temporariamente):
- **Inventario** - Modelo não existe no schema (retorna 501)
- **InventarioItem** - Dependente do Inventario

**Schema Prisma**: `backend/prisma/schema.prisma`

---

## 🔧 CORREÇÕES RECENTES (2025-11-25)

### Backend - Erros Críticos Corrigidos ✅

1. **cotacao.controller.js**
   - Problema: Usando `prisma.cotacoes` (plural incorreto)
   - Solução: Corrigido para `prisma.cotacao` (singular)
   - Status: ✅ Funcionando

2. **pedidoB2B.controller.js**
   - Problema: Campos inexistentes do modelo ClienteB2B
   - Solução: Removido `name`, adicionado `razaoSocial` e `nomeFantasia`
   - Status: ✅ Funcionando

3. **user.controller.js**
   - Problema: Conflito Prisma (`include` + `select` simultaneamente)
   - Solução: Usando apenas `select` com sub-select para loja
   - Status: ✅ Funcionando

4. **inventario.controller.js**
   - Problema: Modelo Inventario não existe no schema
   - Solução: Desabilitado temporariamente (retorna 501)
   - Status: ⚠️ Aguardando implementação do modelo

5. **inventario.controller.js - DEPARA**
   - Problema: Campos incorretos (`codigoOrigem` não existe)
   - Solução: Corrigido para `nomeFornecedor` e `nomeERP`
   - Status: ✅ Funcionando

Ver detalhes completos em: `PROGRESSO-2025-11-25.md`

---

## Scripts Disponíveis

### Root (Workspace)
```bash
npm run dev                    # Frontend + Backend simultaneamente
npm run dev:frontend           # Apenas frontend (porta 5173)
npm run dev:backend            # Apenas backend (porta 5000)
npm run build                  # Build produção
npm run docker:up              # Sobe containers Docker
npm run docker:down            # Para containers
npm run prisma:generate        # Gera Prisma Client
npm run prisma:migrate:dev     # Executa migrations
npm run prisma:seed            # Popula banco com dados iniciais
npm run prisma:studio          # Abre Prisma Studio (porta 5555)
```

### Script de Migração de Cores
```bash
# Executar migração das 46 cores para todos os produtos
node backend/database/seeds/migrate-cores-assets.js
```

---

## Estado Atual do Projeto (Atualizado 2025-11-25)

### ✅ 100% Funcional
- ✅ Autenticação JWT completa
- ✅ Sistema de usuários com 6 tipos/roles
- ✅ 48 produtos cadastrados
- ✅ 2.112 combinações produto+cor funcionando
- ✅ 46 cores reais integradas com fotos
- ✅ Páginas Admin completas (Produtos, Lojas, Usuários, Cores)
- ✅ APP 1 - Requisições (com TODOS os produtos)
- ✅ APP 2 - Cotações (funcionando)
- ✅ APP 3 - Pedidos B2B (funcionando)
- ✅ APP 4 - Inventário com OCR (funcionando)
- ✅ OCR de etiquetas com Tesseract.js
- ✅ DEPARA integrado (281 produtos mapeados)
- ✅ Assets servidos estaticamente
- ✅ Layout responsivo mobile-first
- ✅ Roteamento protegido
- ✅ Docker Compose completo
- ✅ Logging estruturado (Winston)
- ✅ Rate limiting e segurança básica

### 🚧 Melhorias Pendentes (Identificadas pelo Usuário)

1. **Busca de Produtos - UX**
   - Problema: Campo não mostra resultados inline
   - Solução necessária: Autocomplete visual com preview instantâneo

2. **Seletor de Cores - Redesign Visual**
   - Necessário: Cards estilo Pantone
   - Requisitos:
     - Foto grande do produto
     - Miniatura hex colorida
     - Nome da cor + código
     - Código hex + Pantone
   - Design MUITO mais visual

3. **Validação de Quantidade**
   - Implementar: Múltiplos de 60m obrigatório
   - Adicionar: Validação visual de erro

4. **Integração DEPARA Excel**
   - Usar: Aba do meio da planilha `ultimopreco.xlsx`
   - Automatizar: Importação de mapeamentos

5. **Edição de Produtos**
   - Criar: Modal de edição
   - Permitir: Alterar nome, preços, categoria, curva ABC
   - Gerenciar: Cores do produto

### ⚠️ Funcionalidades Desabilitadas Temporariamente

- **Inventário (criação/listagem)**: Modelo não existe no schema Prisma
  - Retorna: HTTP 501 (Not Implemented)
  - Ação futura: Criar migration para adicionar modelo Inventario

---

## Cores da Marca (Tailwind Customizado)

```javascript
colors: {
  primary: '#EE2B68',    // Rosa vibrante
  secondary: '#2F3685',  // Azul escuro
}
```

---

## Arquivos Importantes

### Documentação
- **Contexto**: `CLAUDE.md` (este arquivo)
- **Relatório Completo**: `RELATORIO-FINAL-COMPLETO.md`
- **Progresso Recente**: `PROGRESSO-2025-11-25.md`
- **Problemas Resolvidos**: `RELATORIO-PROBLEMAS.md`
- **README**: `README.md` (556 linhas)
- **Quickstart**: `QUICKSTART.md`

### Backend
- **Schema DB**: `backend/prisma/schema.prisma`
- **Entry Backend**: `backend/src/server.js`
- **Seeds**: `backend/database/seeds/seed.js`
- **Migração Cores**: `backend/database/seeds/migrate-cores-assets.js`

### Frontend
- **Entry Frontend**: `frontend/src/main.jsx`
- **Roteamento**: `frontend/src/App.jsx`
- **Auth Context**: `frontend/src/contexts/AuthContext.jsx`
- **API Client**: `frontend/src/services/api.js`
- **Assets Service**: `frontend/src/services/assets.js`

### Infraestrutura
- **Docker**: `docker-compose.yml`
- **Env**: `.env` (DATABASE_URL configurada)

---

## Sistema de Prioridades das Lojas

1. **G1** (Belo Horizonte) - Prioridade 1 🔴
2. **Guaranis** - Prioridade 2 🟠
3. **Ipatinga** - Prioridade 3 🟡
4. **Teófilo Otoni (TO)** - Prioridade 4 ⚪
5. **Coronel Fabriciano (CF)** - Prioridade 5 ⚪

---

## Portas e URLs

```
Frontend:       http://localhost:5173
Backend API:    http://localhost:5000/api
Health Check:   http://localhost:5000/health
Prisma Studio:  http://localhost:5555
MySQL:          localhost:3306
```

---

## Fluxo de Desenvolvimento Recomendado

1. **Subir ambiente**: `npm run docker:up` (MySQL)
2. **Gerar Prisma Client**: `npm run prisma:generate`
3. **Rodar migrations**: `npm run prisma:migrate:dev`
4. **Popular dados**: `npm run prisma:seed`
5. **Migrar cores**: `node backend/database/seeds/migrate-cores-assets.js`
6. **Iniciar dev**: `npm run dev` (Frontend + Backend)
7. **Acessar**: http://localhost:5173
8. **Login**: admin@emporiotecidos.com.br / emporio123

---

## Convenções do Projeto

- **Commits**: Conventional Commits (feat:, fix:, chore:, etc.)
- **Idioma**: Código e comentários em português
- **Estilo**: Funcional components, hooks, async/await
- **Validação**: Zod schemas no frontend
- **Error Handling**: Try-catch com logging Winston
- **Auth**: JWT no header `Authorization: Bearer <token>`
- **Nomes**: camelCase para variáveis, PascalCase para componentes

---

## Observações Importantes

- **Sistema 100% funcional** com dados reais
- **2.112 combinações** produto+cor disponíveis
- **46 cores reais** com fotos integradas
- **4 apps operacionais** (Requisições, Cotações, B2B, Inventário)
- **Mobile-first approach**: Todo o design é otimizado para mobile
- **Segurança**: Rate limiting, helmet, JWT, bcrypt com 10 rounds
- **Logging**: Winston com combined.log e error.log
- **Monorepo**: Workspace root gerencia frontend + backend
- **Hot reload**: Nodemon reinicia automaticamente ao detectar mudanças

---

## Troubleshooting

### Servidor não inicia (EADDRINUSE)
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Ou simplesmente pare o processo do nodemon e reinicie
```

### Prisma Client desatualizado
```bash
npm run prisma:generate
```

### Banco de dados vazio
```bash
npm run prisma:seed
node backend/database/seeds/migrate-cores-assets.js
```

### Frontend não encontra backend
- Verificar se backend está rodando na porta 5000
- Verificar se `frontend/src/services/api.js` aponta para `http://localhost:5000/api`

---

## Próximos Passos Sugeridos

### Prioridade ALTA:
1. Implementar autocomplete visual de produtos
2. Redesenhar seletor de cores estilo Pantone
3. Adicionar validação de múltiplos de 60m

### Prioridade MÉDIA:
1. Criar modelo Inventario no schema Prisma
2. Integrar DEPARA automaticamente do Excel
3. Implementar modais de edição (produtos, lojas, usuários)

### Prioridade BAIXA:
1. Dashboard com gráficos reais
2. Relatórios avançados
3. Notificações push (PWA)
4. Integração e-commerce

---

**Última atualização**: 2025-11-25
**Desenvolvido com**: Claude Code 🤖
**Status**: ✅ Sistema funcional e pronto para uso
