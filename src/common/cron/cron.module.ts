import { Logger, Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CronController } from './cron.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckService } from './health-check.service';
import { SlackService } from '../chat/slack.service';
import { S3Service } from '../file/s3.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TerminusModule.forRoot({ logger: false }),
    HttpModule,
  ],
  providers: [CronService, SlackService, HealthCheckService, Logger, S3Service],
  controllers: [CronController],
})
export class CronModule {}
