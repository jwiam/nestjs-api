import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// 특정 모듈에서 사용할 미들웨어
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger: Logger = new Logger();

  // 로그 또는 필요에 따라 전처리 작업
  use(req: Request, res: Response, next: () => void): void {
    const { ip, ips, method, path: url } = req;
    const userAgent: string = req.get('user-agent') || '';
    const requestData: string = JSON.stringify(
      method === 'GET' ? req.query : req.body,
    );

    // app.set('trust proxy', true) 설정한 경우, ip 그대로 사용
    const proxyIp =
      Array.isArray(ips) && ips.filter(Boolean).length > 0 ? ips.at(-1) : ip;

    this.logger.log({
      level: 'http',
      message: `${method} ${url} - ${userAgent} -- IP: ${proxyIp} -- RequestData: ${requestData}`,
      context: 'AuthMiddleware',
    });

    next();
  }
}

// 전역 로그용 미들웨어 (클래스 사용 불가)
export function globalMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const now = Date.now();
  const logger: Logger = new Logger();
  const { ip, ips, method, path: url } = req;
  const userAgent = req.get('user-agent') || '';

  // app.set('trust proxy', true) 설정한 경우, ip 그대로 사용
  const proxyIp =
    Array.isArray(ips) && ips.filter(Boolean).length > 0 ? ips.at(-1) : ip;

  // 응답 완료 후 미들웨어 로그
  res.on('close', () => {
    const { statusCode } = res;
    const contentLength = res.get('content-length') ?? 0;
    const requestData = JSON.stringify(method === 'GET' ? req.query : req.body);
    const delay = Date.now() - now;

    logger.log({
      level: 'http',
      message: `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} -- IP: ${proxyIp} -- RequestData: ${requestData} ${delay}ms`,
      context: 'CloseResponse',
    });
  });

  next();
}

// 프록시 서버 실제 IP 주소
// app.set('trust proxy', true) 설정하지 않은 경우, 헤더 분석 필요
export function getRealIp(req: Request): string {
  const requestIp: string | string[] =
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress;

  // XFF 프록시 IP 주소 중 가장 오른쪽 IP 사용
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
  // https://en.wikipedia.org/wiki/X-Forwarded-For
  return String(Array.isArray(requestIp) ? requestIp.at(-1) : requestIp)
    .split(',')
    .map((item: string) => item.trim())
    .at(0);
}

// 쿠키 저장
export function setCookie(
  response: Response,
  name: string,
  value: string,
  option?: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict';
    maxAge: number; // 1d: 24 * 60 * 60 * 1000
  },
) {
  return response.cookie(name, value, option);
}
