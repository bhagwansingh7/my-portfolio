# FROM node:20-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # FROM nginx:1.27-alpine
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
# # COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80
# HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://localhost/ >/dev/null || exit 1


FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 10000

HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost:10000/ >/dev/null || exit 1

CMD ["serve", "-s", "dist", "-l", "10000"]