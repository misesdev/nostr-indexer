# Usar Node 20 Alpine
FROM node:20-alpine

# Diretório da app
WORKDIR /app

# Copiar todo o código da aplicação
COPY . .

# Instalar todas as dependências (dev + prod) para build
RUN npm install

# Build TypeScript
RUN npm run build

# Variáveis de ambiente
ENV NODE_ENV=production

# Comando padrão: rodar seu indexador
CMD ["npm", "run", "start"]
