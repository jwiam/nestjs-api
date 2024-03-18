import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResponseDto } from './response.dto';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto> {
    const { method, url } = context.getArgByIndex(0); // IncomingMessage
    const { statusCode } = context.getArgByIndex(1); // ServerResponse

    // 요청 처리 후 인터셉터
    return next.handle().pipe(
      // 응답 데이터 변경에 사용
      map((data) => {
        // 컨트롤러 및 서비스에서 return 으로 들어오는 값은 data에 담기고
        // 그 외에는 모두 아래 양식으로 응답 (에러 메시지는 AuthFilter 에서 응답)
        const responseBody: ResponseDto = {
          result: true,
          statusCode: statusCode,
          request: `${method} ${url}`,
          timestamp: new Date().toString(),
          message: data?.message ?? data,
        };

        return responseBody;
      }),
    );
  }
}
