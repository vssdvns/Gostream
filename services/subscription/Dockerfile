FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./src ./src
ENV NODE_ENV=production
EXPOSE 5002
CMD ["node", "src/index.js"]
