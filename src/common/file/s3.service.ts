import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PutObjectCommandInput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * 파일 업로드
   *
   * @param {string} key - S3 파일명
   * @param {fs.ReadStream} fileStream - 대상 파일
   * @param {string} prefix - S3 폴더명
   * @return {Promise<PutObjectCommandOutput>}
   */
  async putObjectFile(
    key: string,
    fileStream: fs.ReadStream,
    prefix: string = '',
  ): Promise<PutObjectCommandOutput> {
    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Key: (prefix ? prefix + '/' : prefix) + key,
        Body: fileStream,
      }),
    );
  }

  /**
   * 다중 파일 한번에 업로드
   * Promise.all 메서드 사용 필수
   *
   * @param {PutObjectCommandInput} input
   * @return {Promise<PutObjectCommandOutput>}
   */
  async putObjectFiles(
    input: PutObjectCommandInput,
  ): Promise<PutObjectCommandOutput> {
    return await this.s3Client.send(new PutObjectCommand(input));
  }

  /**
   * 파일 업로드
   *
   * @param {string} key - S3 파일명
   * @param {string} body - 파일 내용
   * @param {string} prefix - S3 폴더명
   * @return {Promise<PutObjectCommandOutput>}
   */
  async putObjectPlain(
    key: string,
    body: string,
    prefix: string = '',
  ): Promise<PutObjectCommandOutput> {
    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Key: (prefix ? prefix + '/' : prefix) + key,
        Body: body,
      }),
    );
  }

  /**
   * 특정 폴더의 파일 리스트
   * 확장자 필터링 및 최대 개수 등록 가능
   *
   * @param {string} prefix
   * @param {number} maxKeys
   * @return {Promise<string[]>}
   */
  async getObjects(
    prefix: string = '',
    maxKeys: number = 30,
  ): Promise<string[]> {
    const { Contents } = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Prefix: prefix ? prefix + '/' : prefix,
        MaxKeys: maxKeys,
      }),
    );

    // 파일명 배열
    let files: string[] = [];

    if (Contents.length > 0) {
      // 특정 파일 필터링
      switch (prefix) {
        case 'logs':
          files = Contents.map((content) => content.Key).filter(
            (file) => path.extname(file).toLowerCase() === '.log',
          );
          break;
        default:
          files = Contents.map((content) => content.Key);
          break;
      }
    }

    return files;
  }

  /**
   * 버킷에 파일이 있는 지 확인
   *
   * @param {string} filename - 파일명, S3 경로를 제외한 Key 값
   * @param {string} prefix - S3 경로명
   * @param {string | undefined} versionId - 파일 버전 ID값
   */
  async getObject(
    filename: string,
    prefix: string,
    versionId: string | undefined = undefined,
  ): Promise<object> {
    const { $metadata, LastModified, ContentLength, VersionId, ContentType } =
      await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
          Key: `${prefix}/${filename}`,
          VersionId: versionId,
        }),
      );

    return {
      httpStatusCode: $metadata.httpStatusCode,
      contentLength: ContentLength,
      contentType: ContentType,
      lastModified: LastModified,
      versionId: VersionId,
    };
  }

  /**
   * S3 파일을 로컬 디스크에 다운로드
   *
   * @param {string} filename - 파일명, S3 경로를 제외한 Key 값
   * @param {string} destination - 로컬에 저장 할 폴더명
   * @param {string} prefix - S3 경로명
   * @param {string | undefined} versionId - 파일 버전 ID값
   */
  async downloadObject(
    filename: string,
    destination: string,
    prefix: string,
    versionId: string | undefined = undefined,
  ): Promise<boolean> {
    const { Body } = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Key: `${prefix}/${filename}`,
        VersionId: versionId,
      }),
    );

    // 프로젝트 루트 폴더
    const rootPath: string = path.join(__dirname + '/../../../');

    // 프로젝트 루트 폴더가 존재하지 않는 경우
    if (
      !fs.existsSync(rootPath) &&
      rootPath.split('/').filter(Boolean).pop() !==
        this.configService.get('ROOT_DIRECTORY')
    ) {
      throw new InternalServerErrorException({
        message: '폴더 경로에 대한 환경변수를 확인해주세요.',
      });
    }

    // 저장 할 폴더 경로
    const downloadFolder: string = path.join(
      rootPath,
      this.configService.get<string>('UPLOAD_DISK_PATH'),
      destination,
    );

    // 저장 할 폴더가 없으면 생성
    !fs.existsSync(downloadFolder) &&
      fs.mkdirSync(downloadFolder, { recursive: true });

    // S3 파일 데이터
    const uint8Array: Uint8Array = await Body.transformToByteArray();

    // 로컬 디스크 파일에 덮어쓰기
    const writeStream: fs.WriteStream = fs.createWriteStream(
      downloadFolder + '/' + filename,
    );

    // 파일 생성 및 생성 여부
    return writeStream.write(uint8Array);
  }

  /**
   * 여러개의 S3 파일들을 동시에 삭제
   *
   * @param {object} deleteObject - [{Key: '', VersionId: ''}, ...]
   * @return {Promise<object>}
   */
  async deleteObjects(deleteObject: object): Promise<object> {
    const { Deleted, Errors } = await this.s3Client.send(
      new DeleteObjectsCommand(<DeleteObjectsCommandInput>{
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Delete: {
          Objects: deleteObject, // [{Key: '', VersionId: ''}, ...]
        },
      }),
    );

    return Object.assign({
      Deleted,
      Errors,
    });
  }

  /**
   * 특정 S3 파일 삭제
   *
   * @param {string} filename - 파일명, S3 경로를 제외한 키 값
   * @param {string} prefix - S3 폴더명
   * @param {string} versionId - S3 버전 ID 값, undefined 인 경우 모든 버전의 파일 일괄 삭제
   */
  async deleteObject(
    filename: string,
    prefix: string,
    versionId: string | undefined = undefined,
  ): Promise<object> {
    const { $metadata, DeleteMarker, VersionId } = await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Key: `${prefix}/${filename}`,
        VersionId: versionId,
      }),
    );

    return {
      httpStatusCode: $metadata.httpStatusCode,
      deleteMarker: DeleteMarker, // true 이면 모든 버전을 포함한 해당 파일 삭제
      versionId: VersionId,
    };
  }
}
