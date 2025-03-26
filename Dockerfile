FROM node:18-alpine

WORKDIR /app

# 의존성 먼저 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 실행 (스크립트 파일 생성)
RUN echo '#!/bin/sh \n\
  if [ "$NODE_ENV" != "production" ]; then \n\
  echo "Running in development mode, using synchronize" \n\
  elif [ "$RUN_MIGRATIONS" = "true" ]; then \n\
  echo "Running migrations..." \n\
  npm run migration:run \n\
  fi \n\
  node dist/app.js' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 5001
CMD ["/app/start.sh"]