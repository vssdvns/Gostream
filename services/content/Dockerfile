FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install

# Create uploads dir before copying to avoid overwrite
RUN mkdir -p /app/uploads

COPY ./src ./src

ENV NODE_ENV=production
EXPOSE 5003

CMD ["node", "src/index.js"]
