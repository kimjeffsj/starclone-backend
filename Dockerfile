FROM node:18-alpine

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 포트 설정
EXPOSE 5001

# 서버 실행 (프로덕션 모드)
CMD ["npm", "run", "start"]