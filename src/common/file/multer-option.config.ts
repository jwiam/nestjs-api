import {
  Injectable,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { MimeType } from './allowed-mime.array';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Injectable()
export class MulterOptionConfig implements MulterOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          console.log('destination: ');
          console.log(file);

          const nowDate = new Date();
          const nowDestination =
            nowDate.getFullYear() +
            '-' +
            String(nowDate.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(nowDate.getDate()).padStart(2, '0');
          const dest =
            this.configService.get<string>('UPLOAD_DISK_PATH') +
            '/' +
            nowDestination;

          // 폴더명 길이 확인 (최대 100)
          if (dest.length > 100) {
            return callback(
              new ServiceUnavailableException('Too long folder name'),
              '',
            );
          }

          // 폴더 없는 경우, 폴더 생성
          !fs.existsSync(dest) && fs.mkdirSync(dest, { recursive: true });
          callback(null, dest);
        },
        filename: (req, file, callback) => {
          console.log('filename: ');
          console.log(file);

          const filename =
            Date.now() + '-' + randomUUID() + extname(file.originalname);

          // 업로드하는 파일명 길이 확인 (최대 255)
          if (filename.length > 255) {
            return callback(
              new ServiceUnavailableException('Too long upload filename'),
              '',
            );
          }

          // 파일명에 확장자 붙이고 업로드
          callback(null, filename);
        },
      }),
      limits: {
        fieldNameSize: 8,
        fieldSize: 5,
        fields: 3,
        fileSize: 4000,
        files: 1,
      },
      fileFilter: (req, file, callback) => {
        console.log(req.body?.s3);
        console.log(req.get('body'));

        console.log('fileFilter: ');
        console.log(file);

        // 업로드 지원하는 파일 타입 확인
        if (!MimeType.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException('File type not allowed'),
            false,
          );
        }

        // 업로드하는 파일명 길이 확인 (최대 255)
        if (file.originalname.length > 255) {
          return callback(
            new ServiceUnavailableException('Too long original filename'),
            false,
          );
        }

        callback(null, true);
      },
    };
  }
}

// TODO: FileInterceptor 두번째 인자로 MulterOptions 사용 가능
export const diskStorageOption: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const nowDate = new Date();
      const nowDestination =
        nowDate.getFullYear() +
        '-' +
        String(nowDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(nowDate.getDate()).padStart(2, '0');
      const dest = process.env.UPLOAD_DISK_PATH + '/' + nowDestination;

      // 폴더명 길이 확인 (최대 100)
      if (dest.length > 100) {
        return callback(
          new ServiceUnavailableException('Too long folder name'),
          '',
        );
      }

      // 폴더 없는 경우, 폴더 생성
      !fs.existsSync(dest) && fs.mkdirSync(dest, { recursive: true });
      callback(null, dest);
    },
    filename: (req, file, callback) => {
      const filename =
        Date.now() + '-' + randomUUID() + extname(file.originalname);

      // 업로드하는 파일명 길이 확인 (최대 255)
      if (filename.length > 255) {
        return callback(
          new ServiceUnavailableException('Too long upload filename'),
          '',
        );
      }

      // 파일명에 확장자 붙이고 업로드
      callback(null, filename);
    },
  }),
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 3,
    fileSize: 4000,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    // 업로드 지원하는 파일 타입 확인
    if (!MimeType.includes(file.mimetype)) {
      return callback(
        new UnsupportedMediaTypeException('File type not allowed'),
        false,
      );
    }

    // 업로드하는 파일명 길이 확인 (최대 255)
    if (file.originalname.length > 255) {
      return callback(
        new ServiceUnavailableException('Too long original filename'),
        false,
      );
    }

    callback(null, true);
  },
};
