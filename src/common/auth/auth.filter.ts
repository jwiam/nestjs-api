import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { ResponseDto } from './response.dto';
import { JsonWebTokenError } from '@nestjs/jwt';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class AuthFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private readonly logger = new Logger();

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // 예외 또는 에러명
    const exceptionName = exception['response']?.name ?? exception['name'];

    // 에러 메시지는 /node_modules/jsonwebtoken/verify.js 참고
    const jwtMessage: object = {
      'jwt expired': 'jwt 토큰이 만료되었습니다.',
      'invalid token': '유효하지 않은 jwt 토큰입니다.',
      'jwt malformed': 'jwt 토큰의 형식이 올바르지 않습니다.',
      'jwt must be provided': 'jwt 토큰이 존재하지 않습니다.',
      'invalid signature': 'jwt 토큰의 서명이 유효하지 않습니다.',
    };

    // 예외 또는 에러 메시지
    const message =
      exception instanceof QueryFailedError
        ? `SQLSTATE[${exception['sqlState'] ?? exception['syscall']}] ${
            exception['code']
          }(${exception['errno']})`
        : exception instanceof JsonWebTokenError
          ? jwtMessage[exception['message']] ?? exception['message']
          : exception instanceof ThrottlerException
            ? '요청이 너무 많습니다.'
            : exception['response']?.message ??
              exception['message'].replace('Exception', '').trim();

    // 사용자에게 보낼 응답 데이터
    const responseBody: ResponseDto = {
      result: false,
      statusCode:
        exception['response']?.status ??
        exception['status'] ??
        HttpStatus.BAD_REQUEST,
      request: `${httpAdapter.getRequestMethod(
        ctx.getRequest(),
      )} ${httpAdapter.getRequestUrl(ctx.getRequest())}`,
      timestamp: new Date().toString(),
      message: { error: message },
    };

    // 개발자가 확인 할 로그 데이터
    const debuggingLog = Object.assign({}, responseBody, {
      query: exception['sql'] ?? undefined,
      stack: exception['response']?.stack ?? exception['stack'],
      messageData: exception['response']?.message,
      message: Array.isArray(exception['response']?.message)
        ? exception['message'].replace('Exception', '').trim()
        : responseBody.message['error'],
    });

    // 로그 기록
    this.logger.error(debuggingLog, debuggingLog.stack, exceptionName);

    // 에러 응답
    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}
