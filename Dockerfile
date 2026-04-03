FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . . 

RUN pnpm run build

CMD ["node", "dist/main.js"]