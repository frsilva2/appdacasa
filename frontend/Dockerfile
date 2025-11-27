FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
