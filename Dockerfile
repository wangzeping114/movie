# 构建阶段
FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install \
    && npm run build

EXPOSE 4173

CMD [ "npm", "run", "preview", "--", "--host", "0.0.0.0" ] 