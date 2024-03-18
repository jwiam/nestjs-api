import { OmitType } from '@nestjs/swagger';

export class ResponseDto {
  /**
   * 응답 결과
   * @example true
   */
  result: boolean;

  /**
   * 응답 코드
   * @example 201
   */
  statusCode: number;

  /**
   * 요청 메소드 및 URL
   * @example 'POST /member'
   */
  request: string;

  /**
   * 응답 시간
   * @example 'Wed Jan 01 2024 13:00:00 GMT+0900 (Korean Standard Time)'
   */
  timestamp: string;

  /**
   * 응답 메시지
   */
  message: object;
}

export class ResponseErrorDto extends OmitType(ResponseDto, ['message']) {
  /**
   * 응답 결과
   * @example false
   */
  result: boolean;

  /**
   * 응답 코드
   * @example 400
   */
  statusCode: number;

  /**
   * 요청 메소드 및 URL
   * @example 'POST /member'
   */
  request: string;

  /**
   * 응답 시간
   * @example 'Wed Jan 01 2024 13:00:00 GMT+0900 (Korean Standard Time)'
   */
  timestamp: string;

  /**
   * 에러 메시지
   */
  message: {
    error: string;
  };
}
