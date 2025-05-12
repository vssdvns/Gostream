# Stage 1: Base Node image
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Final image with FFmpeg + Node
FROM jrottenberg/ffmpeg:5.1-alpine

# Install Node.js and dependencies
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy app from builder
COPY --from=builder /app /app

# Make sure uploads folder exists
RUN mkdir -p /app/uploads

EXPOSE 4000

# Override default ENTRYPOINT from FFmpeg image
ENTRYPOINT []

CMD ["node", "index.js"]
