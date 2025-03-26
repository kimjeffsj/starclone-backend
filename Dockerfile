FROM node:18-alpine

WORKDIR /app

# 의존성 먼저 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 실행
EXPOSE 5001
CMD ["node", "dist/app.js"]