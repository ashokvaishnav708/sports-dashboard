FROM node:24-alpine

WORKDIR /backend

RUN npm install -g pnpm

RUN pnpm approve-builds esbuild

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 8000


CMD ["pnpm", "start"]