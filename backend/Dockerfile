FROM node:18

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
