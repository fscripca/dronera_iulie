FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Ensure .env is present (generated before build)
COPY .env .env

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
