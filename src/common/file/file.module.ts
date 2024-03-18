import {
  Module,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { MimeType } from './allowed-mime.array';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { BranchService } from '../../member/branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../member/entities/branch.entity';
import { File } from './entities/file.entity';

@Module({
  // imports: [
  //   MulterModule.registerAsync({
  //     imports: [ConfigModule],
  //     inject: [ConfigService],
  //     useFactory: async (configService: ConfigService) => ({
  //       storage: diskStorage({
  //         destination: (req, file, callback) => {
  //           console.log('destination: ');
  //           console.log(file);
  //
  //           const nowDate = new Date();
  //           const nowDestination =
  //             nowDate.getFullYear() +
  //             '-' +
  //             String(nowDate.getMonth() + 1).padStart(2, '0') +
  //             '-' +
  //             String(nowDate.getDate()).padStart(2, '0');
  //           const dest =
  //             configService.get<string>('UPLOAD_DISK_PATH') +
  //             '/' +
  //             nowDestination;
  //
  //           // 폴더명 길이 확인 (최대 100)
  //           if (dest.length > 100) {
  //             return callback(
  //               new ServiceUnavailableException('Too long folder name'),
  //               '',
  //             );
  //           }
  //
  //           // 폴더 없는 경우, 폴더 생성
  //           !fs.existsSync(dest) && fs.mkdirSync(dest, { recursive: true });
  //           callback(null, dest);
  //         },
  //         filename: (req, file, callback) => {
  //           console.log('filename: ');
  //           console.log(file);
  //
  //           const filename =
  //             Date.now() + '-' + randomUUID() + extname(file.originalname);
  //
  //           // 업로드하는 파일명 길이 확인 (최대 255)
  //           if (filename.length > 255) {
  //             return callback(
  //               new ServiceUnavailableException('Too long upload filename'),
  //               '',
  //             );
  //           }
  //
  //           // 파일명에 확장자 붙이고 업로드
  //           callback(null, filename);
  //         },
  //       }),
  //       limits: {
  //         fieldNameSize: 8,
  //         fieldSize: 5,
  //         fields: 3,
  //         fileSize: 4000,
  //         files: 1,
  //       },
  //       fileFilter: (req, file, callback) => {
  //         console.log(req.body?.s3);
  //         console.log(req.get('body'));
  //
  //         console.log('fileFilter: ');
  //         console.log(file);
  //
  //         // 업로드 지원하는 파일 타입 확인
  //         if (!MimeType.includes(file.mimetype)) {
  //           return callback(
  //             new UnsupportedMediaTypeException('File type not allowed'),
  //             false,
  //           );
  //         }
  //
  //         // 업로드하는 파일명 길이 확인 (최대 255)
  //         if (file.originalname.length > 255) {
  //           return callback(
  //             new ServiceUnavailableException('Too long original filename'),
  //             false,
  //           );
  //         }
  //
  //         callback(null, true);
  //       },
  //     }),
  //   }),
  // ],
  // exports: [MulterModule],
  imports: [TypeOrmModule.forFeature([File, Branch])],
  controllers: [FileController],
  providers: [FileService, BranchService],
})
export class FileModule {}
