### 설치 패키지

| 목록     | 패키지명                                                                                 |
|--------|--------------------------------------------------------------------------------------|
| 환경변수   | `@nestjs/config`                                                                     |
| 데이터베이스 | `@nestjs/typeorm`, `typeorm`, `mysql2`                                               |
| 값 검증   | `class-transformer`, `class-validator`, `joi`                                        |
| 로그 기록  | `nest-winston`, `winston`                                                            |
| 인증     | `@nestjs/jwt` `cookie-parser`, `@types/cookie-parser`                                |
| 스케줄링   | `@nestjs/schedule`                                                                   |
| 헬스 체크  | `@nestjs/terminus`, `@nestjs/axios`, `axios`                                         |
| 메시지 전송 | `nodemailer`, `@types/nodemailer`                                                    |
| 파일     | `@types/multer`, `multer`, `@aws-sdk/client-s3`, `multer-s3`, `@nestjs/serve-static` |
| 문서화    | `@nestjs/swagger`                                                                    |
| 보안     | `express-basic-auth`, `helmet`, `@nestjs/throttler`                                  |
| 캐싱     | `@nestjs/cache-manager`, `cache-manager`                                             |

### 검토

1. Testing
2. Redis(Queues, Rate Limiting, Caching)
3. WebSocket(ws/socket.io)
4. CI/CD(GitHub Actions/Jenkins)

### 구조

```
├── envs  # 환경변수
├── logs  # 로그기록
├── files # 리소스 파일 및 임시 업로드 경로
└── src
    ├── common
    │   ├── auth  # 인증, 권한, 보안, 예외 필터
    │   ├── chat  # 메일, MMS, 채팅, 슬랙
    │   ├── cron  # 스케줄, 큐, 헬스 체크
    │   └── file  # 파일 CRUD, 엑셀 CR
    └── member    # 멤버, 메뉴, 지점, 권한 CRUD
```

### 명령어

| 명령어                                          | 기능                                                                      |
|----------------------------------------------|-------------------------------------------------------------------------|
| nest -h                                      | 사용 가능한 CLI 명령어 [(옵션 참조)](https://docs.nestjs.com/cli/usages)            |
| nest g res common/sample --no-spec           | src/common/sample 폴더를 만들고, 테스트 파일 없이 CRUD 및 entities, dto 폴더 생성         |
| nest g f common/sample --no-spec             | 기존에 있던 src/common/sample 폴더에 테스트 파일 없이 sample.filter.ts 파일 생성           |
| nest g f common/sample/test --no-spec --flat | 기존에 있던 src/common/sample 폴더에 테스트 파일 없이 test.filter.ts 파일 생성             |
| pm2 start ecosystem.config.js                | pm2 시작 명령어 [(옵션 참조)](https://pm2.keymetrics.io/docs/usage/quick-start/) |

### 환경변수
```conf
ROOT_DIRECTORY=sample-test

DB_HOST=localhost
DB_PORT=3306
DB_SCHEMA=api
DB_USERNAME=root
DB_PASSWORD=root
DB_ENTITIES=dist/**/*.entity.{js,ts}
DB_CHARSET=utf8mb4_unicode_ci

JWT_ACCESS_SECRET_KEY='sample-test-jwt-access'
JWT_ACCESS_EXPIRES_TIME=3h
JWT_REFRESH_SECRET_KEY='sample-test-jwt-refresh'
JWT_REFRESH_EXPIRES_TIME=9h
JWT_EMAIL_VALIDATION_SECRET_KEY='sample-test-jwt-email'
JWT_EMAIL_VALIDATION_EXPIRES_TIME=30m

SLACK_CHANNEL=
SLACK_TOKEN=
SLACK_WEBHOOK=

EMAIL_USERNAME=
EMAIL_PASSWORD=

UPLOAD_DISK_PATH=files
UPLOAD_S3_PATH=files

AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=

SWAGGER_USERNAME=sample-test-swagger
SWAGGER_PASSWORD=sample-test-password
```

### 참고사항

- 사용 버전: `nvm-0.39.7`, `nodejs-20.11.0`, `npm-10.2.4`, `nestjs-10.3.0`, `mysql-8.0.35`, `nginx-1.18.0`, `pm2-5.3.1`
- [공식 문서](https://docs.nestjs.com/)에서 추천하는 패키지 사용
- [@nestjs/terminus](https://docs.nestjs.com/recipes/terminus)
- [@nestjs/axios](https://docs.nestjs.com/techniques/http-module)
- [@nestjs/schedule node-cron](https://github.com/kelektiv/node-cron)
- [@nestjs/typeorm decorator](https://typeorm.io/decorator-reference)
- [@nestjs/cache-manager](https://docs.nestjs.com/techniques/caching)
- [class-validator](https://github.com/typestack/class-validator)
- [winston](https://github.com/winstonjs/winston)
- [helmet](https://github.com/helmetjs/helmet)
- [cors](https://github.com/expressjs/cors)
- [pm2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage)
- [aws s3 sdk examples](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html)
- [git commit convention](https://www.conventionalcommits.org/en/v1.0.0/)
- [homebrew 를 이용한 nvm 설치](https://formulae.brew.sh/formula/nvm)
- [homebrew 를 이용한 mysql 설치](https://formulae.brew.sh/formula/mysql)

### 운영환경
- 서버: AWS EC2 (Ubuntu 22.04.4 LTS)
- DB: AWS RDS (MySQL 8.0.35)
- 웹서버: nginx/1.18.0, pm2/5.3.1
  - nginx 설정(https 설정은 AWS 로드밸런서에서 443 리스너 설정)
    - ```
      server {
        listen 80 default_server;
        listen [::]:80 default_server;

        location = /health-check {
                access_log off;
                return 200 'OK';
                add_header Content-Type text/plain;
        }

        location ^~ / {
                return 444;
        }
      }

      server {
        listen 80;
        listen [::]:80;
        server_name SAMPLE_DOMAIN;

        location ~ /\. {
                return 444;
        }

        location / {
                if ($http_x_forwarded_proto = 'http') {
                        return 301 https://$server_name$request_uri;
                }

                limit_except GET POST PUT PATCH DELETE { deny all; }

                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
      }
      ```