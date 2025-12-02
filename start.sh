#!/usr/bin/env bash

npm install -g pnpm >/dev/null 2>&1

echo "==> Installing dependencies with pnpm..."
pnpm install --frozen-lockfile || pnpm install

echo "==> Running database migrations..."
pnpm db:push

echo "==> Building application..."
pnpm build

pnpm start
