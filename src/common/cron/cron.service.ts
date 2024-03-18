import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { S3Service } from '../file/s3.service';
import { SlackService } from '../chat/slack.service';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommandInput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';

/**
 * 스케줄 등록, 삭제, 중지 등의 작업을 컨트롤러를 통해서 유동적으로 처리 가능
 *
 * 컨트롤러를 이용해서 스케줄 등록을 하지 않는 경우
 * @Cron, @Interval, @Timeout 데코레이터를 이용해 어느 서비스에서든 등록 가능
 */
@Injectable()
export class CronService {
  private readonly logger: Logger = new Logger();

  constructor(
    private readonly scheduler: SchedulerRegistry,
    private readonly s3Service: S3Service,
    private readonly slackService: SlackService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Cron 데코레이터로 생성 된 Cron 리스트
   *
   * @return {Object[]}
   */
  getCrons(): object[] {
    const jobs = this.scheduler.getCronJobs();
    const list: object[] = [];
    jobs.forEach((val, key, map) => {
      list.push({
        name: key,
        cronTime: map.get(key)['cronTime']['source'],
      });
    });

    return list;
  }

  /**
   * Interval 데코레이터로 생성 된 Cron 리스트
   *
   * @return {string[]}
   */
  getIntervals(): string[] {
    return this.scheduler.getIntervals();
  }

  /**
   * Timeout 데코레이터로 생성 된 Cron 리스트
   *
   * @return {string[]}
   */
  getTimeouts(): string[] {
    return this.scheduler.getTimeouts();
  }

  handleCron() {
    this.logger.debug('Task Called', this.handleCron.name);
  }

  handleInterval() {
    this.logger.debug('Task Called by interval', this.handleInterval.name);
  }

  handleTimeout() {
    this.logger.debug('Task Called by timeout', this.handleTimeout.name);
  }

  /**
   * 매일 오전 1시에 로그 파일을 S3 저장
   * 10Mb 이상이면 슬랙 메시지 발송 후 스킵
   * 업로드 된 로그 파일의 자동 삭제는 S3 버킷의 수명 주기 규칙 활용
   *
   * @return {Promise<PutObjectCommandOutput[]>} - S3 저장 결과
   */
  async logHandling(): Promise<PutObjectCommandOutput[]> {
    // 프로젝트 루트 폴더
    const rootPath: string = path.join(__dirname + '/../../../');

    // 폴더가 존재하지 않는 경우
    if (
      !fs.existsSync(rootPath) &&
      rootPath.split('/').filter(Boolean).pop() !==
        this.configService.get('ROOT_DIRECTORY')
    ) {
      throw new InternalServerErrorException({
        message: '폴더 경로에 대한 환경변수를 확인해주세요.',
      });
    }

    // 로그파일 루트 폴더
    const logsPath = path.join(rootPath, 'logs');

    // 로그 파일만 보기
    const files: string[] = fs
      .readdirSync(logsPath)
      .filter((file) => path.extname(file).toLowerCase() === '.log');

    // S3 버킷에 한번에 업로드 하기 위한 배열
    const putObjectInputs: PutObjectCommandInput[] = [];

    // 파일 정보 확인
    for (const i in files) {
      // 파일 경로 및 이름
      const file = path.join('logs', files[i]);

      // 파일 정보
      const stat: fs.Stats = fs.lstatSync(file);

      // 현재 시간과 파일 생성 시간 차이 (단위: ms)
      const diffMs: number = Date.now() - parseInt(String(stat.birthtimeMs));

      // 1000: ms 단위 변환 / 3600(초): 1시간 / 24(시간): 1일
      const diffDay: number = diffMs / 1000 / 3600 / 24;

      // 로그 파일이 10Mb 이상인 경우, 슬랙 메시지 발송 후 건너뜀
      if (stat.size > 1024 * 1024 * 10) {
        await this.slackService.sendSlack(
          this.configService.get('SLACK_WEBHOOK'),
          this.configService.get('SLACK_CHANNEL'),
          `${file} file is over 10Mb`,
          this.configService.get('SLACK_TOKEN'),
        );

        continue;
      }

      // 생성 후 하루가 지난 파일 && 사이즈가 0 이상인 파일
      if (diffDay > 1 && stat.size > 0) {
        const fileStream: fs.ReadStream = fs.createReadStream(file);

        // 배열에 S3 Input 파라미터 작성
        putObjectInputs.push({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
          Key: 'logs/' + files[i],
          Body: fileStream,
        });
      }
    }

    // S3 업로드 및 기존 파일 초기화
    return await Promise.all(
      putObjectInputs.map((input) => {
        for (const i in files) {
          // 파일 경로 및 이름
          const file = path.join('logs', files[i]);

          // 업로드 완료 후 삭제 및 재생성
          fs.unlinkSync(file);
          fs.writeFileSync(file, '');
        }

        return this.s3Service.putObjectFiles(input);
      }),
    );
  }
}
