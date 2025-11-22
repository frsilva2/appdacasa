# 🚀 Guia Rápido de Instalação

Este guia mostra como executar o projeto rapidamente para desenvolvimento.

## ⚡ Início Rápido com Docker (Recomendado)

### Pré-requisitos
- Docker Desktop instalado
- Git instalado

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd emporio-tecidos-sistema
```

2. **Configure o ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Use os valores padrão ou edite conforme necessário
```

3. **Suba os containers**
```bash
docker-compose up -d
```

4. **Execute as migrations e seed**
```bash
# Entre no container do backend
docker-compose exec backend sh

# Execute as migrations
npx prisma generate
npx prisma migrate dev

# Execute o seed (dados iniciais)
npm run prisma:seed

# Saia do container
exit
```

5. **Acesse o sistema**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

6. **Faça login**
```
Email: admin@emporiotecidos.com.br
Senha: emporio123
```

## 🖥️ Desenvolvimento Local (sem Docker)

### Pré-requisitos
- Node.js 18+
- MySQL 8.0
- Git

### Passos

1. **Clone e configure**
```bash
git clone <url-do-repositorio>
cd emporio-tecidos-sistema
cp .env.example .env
# Edite o .env com suas configurações de MySQL
```

2. **Crie o banco de dados**
```bash
mysql -u root -p
CREATE DATABASE emporio_tecidos;
exit;
```

3. **Instale as dependências**
```bash
npm install
```

4. **Configure o Prisma**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
cd ..
```

5. **Inicie os servidores**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Acesse o sistema**
- Frontend: http://localhost:5173

## 👤 Credenciais Padrão

Após executar o seed, você pode fazer login com:

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@emporiotecidos.com.br | emporio123 |
| Gerente G1 | gerente.g1@emporiotecidos.com.br | emporio123 |
| Gerente Guaranis | gerente.guaranis@emporiotecidos.com.br | emporio123 |
| Usuário CD | cd1@emporiotecidos.com.br | emporio123 |

## 🔧 Comandos Úteis

```bash
# Ver logs do Docker
docker-compose logs -f

# Parar containers
docker-compose down

# Reconstruir containers
docker-compose up -d --build

# Acessar Prisma Studio
cd backend
npx prisma studio

# Limpar tudo e recomeçar
docker-compose down -v
docker-compose up -d
# Execute novamente as migrations e seed
```

## 🐛 Problemas Comuns

### Erro: Port already in use

**Solução**: Mude a porta no `.env` ou pare o processo que está usando a porta:

```bash
# Para porta 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Para porta 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Erro: Cannot connect to MySQL

**Solução**: Verifique se o MySQL está rodando:

```bash
docker-compose ps
# Verifique se o container mysql está "Up"
```

### Erro: Prisma Client not generated

**Solução**: Gere o Prisma Client:

```bash
cd backend
npx prisma generate
```

### Frontend não conecta na API

**Solução**: Verifique a variável `VITE_API_URL` no `.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

## 📚 Próximos Passos

Agora que o sistema está rodando, você pode:

1. ✅ Explorar o dashboard
2. ✅ Testar as diferentes aplicações
3. ✅ Criar requisições de abastecimento
4. ✅ Gerenciar usuários e lojas
5. ✅ Configurar produtos e estoque

Para mais detalhes, consulte o [README.md](./README.md) completo.

## 🆘 Suporte

Se encontrar problemas, verifique:
- Os logs do Docker: `docker-compose logs -f`
- Os logs do backend: `backend/logs/`
- A documentação completa no README.md
