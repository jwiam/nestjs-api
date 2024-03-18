import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModule } from './member/member.module';
import { CronModule } from './common/cron/cron.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmLogger } from './common/auth/typeorm.logger';
import * as Joi from 'joi';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ProxyThrottlerGuard } from './common/auth/proxy-throttler.guard';
import { HttpCacheInterceptor } from './common/auth/http-cache.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { FileModule } from './common/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `envs/.${process.env.NODE_ENV}.env`,
      validationSchema: Joi.object({
        // 운영 환경 (노드 환경 변수)
        NODE_ENV: Joi.string()
          .valid('local', 'dev', 'prod')
          .default('dev')
          .required(),
        // 타임존 (노드 환경 변수)
        TZ: Joi.string()
          .valid('Asia/Seoul', 'Asia/Hong_Kong', 'Asia/Tokyo', 'UTC')
          .default('Asia/Seoul')
          .required(),

        // 루트 폴더명
        ROOT_DIRECTORY: Joi.string().required(),

        // 데이터베이스
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_SCHEMA: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_ENTITIES: Joi.string().required(),
        DB_CHARSET: Joi.string().required(),

        // JSON Web Token
        JWT_ACCESS_SECRET_KEY: Joi.string().required(),
        JWT_ACCESS_EXPIRES_TIME: Joi.string().required(),
        JWT_REFRESH_SECRET_KEY: Joi.string().required(),
        JWT_REFRESH_EXPIRES_TIME: Joi.string().required(),
        JWT_EMAIL_VALIDATION_SECRET_KEY: Joi.string().required(),
        JWT_EMAIL_VALIDATION_EXPIRES_TIME: Joi.string().required(),

        // 슬랙
        SLACK_CHANNEL: Joi.string().required(),
        SLACK_TOKEN: Joi.string().required(),
        SLACK_WEBHOOK: Joi.string().required(),

        // 이메일 발송 계정
        EMAIL_USERNAME: Joi.string().email().required(),
        EMAIL_PASSWORD: Joi.string().required(),

        // 파일 업로드 경로
        UPLOAD_DISK_PATH: Joi.string().required(),
        UPLOAD_S3_PATH: Joi.string().required(),

        // Amazon Web Services
        AWS_ACCESS_KEY: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
        AWS_S3_REGION: Joi.string().required(),

        // OpenAPI(Swagger) 문서 접속 계정
        SWAGGER_USERNAME: Joi.string().required(),
        SWAGGER_PASSWORD: Joi.string().required(),
      }),
      validationOptions: {
        // allowUnknown: false,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_SCHEMA,
      entities: [process.env.DB_ENTITIES],
      charset: process.env.DB_CHARSET,
      synchronize: true,
      timezone: '+09:00',
      logger: new TypeOrmLogger('all'),
      maxQueryExecutionTime: 1000,
    }),
    ThrottlerModule.forRoot([{ ttl: 10000, limit: 10 }]),
    CacheModule.register({ ttl: 2000, max: 10 }),
    ServeStaticModule.forRoot({
      rootPath: 'files',
      serveRoot: '',
      renderPath: 'files',
    }),
    FileModule,
    CronModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ProxyThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}
