FROM node:20-bullseye

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

# pnpm + mysql client para desenvolvimento
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate \
  && apt-get update && apt-get install -y --no-install-recommends \
    default-mysql-client \
  && rm -rf /var/lib/apt/lists/*

# Instala dependências (útil para cache de build)
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile || pnpm install

# Código da aplicação (em dev normalmente será sobrescrito pelo volume)
COPY . .

EXPOSE 3000

# Comando padrão de desenvolvimento
CMD ["bash", "start.sh"]
