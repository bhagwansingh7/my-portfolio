FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY . .
RUN mkdir -p /app/uploads && chown -R node:node /app
USER node

EXPOSE 5000
# seed.js is idempotent: it waits for MySQL, creates missing data, then exits.
CMD ["sh", "-c", "node seed.js && node src/server.js"]
