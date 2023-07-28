FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY dist .

CMD ["node", "srv/index.js"]
