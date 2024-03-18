import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SlackService {
  /**
   * 생성자로 주입받아 사용할 경우, HttpModule 모듈 import 필요
   * @private {HttpService}
   */
  private readonly httpService: HttpService = new HttpService();

  /**
   * 슬랙 메시지 발송
   *
   * @param {string} webhook - 웹훅 URL
   * @param {string} channel - 슬랙 채널
   * @param {string} text - 메시지
   * @param {string} token - 슬랙 인증 토큰
   * @return {Promise<{ result: string }>} - 발송 결과
   */
  async sendSlack(
    webhook: string,
    channel: string,
    text: string,
    token: string,
  ): Promise<{ result: string }> {
    const { data } = await firstValueFrom(
      this.httpService.post(
        webhook,
        {
          channel: channel,
          text: text,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=utf8',
          },
        },
      ),
    );
    return { result: data };
  }
}
