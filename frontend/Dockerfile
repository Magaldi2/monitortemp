FROM node:22-alpine

WORKDIR /app

COPY . .
COPY package*.json ./

RUN npm install next react react-dom

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]
