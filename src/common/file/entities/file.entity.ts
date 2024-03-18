import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FileStorageEnum } from '../file.enum';

@Entity()
export class File {
  /**
   * 파일 기본키<br/>
   * (Auto Increment)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 지점 기본키
   */
  @Column('int', {
    nullable: false,
    comment: '지점 기본키',
  })
  branchId: number;

  /**
   * 업로드 했을 때의 파일명<br/>
   * 다운로드 하는 경우 이 파일명 사용 (수정 가능)
   */
  @Column('varchar', {
    nullable: false,
    comment: '업로드 했을 때의 파일명',
  })
  originalname: string;

  /**
   * 고유한 파일명<br/>
   * 파일 불러올 때 사용 (randomUUID 등 고유값 함수 이용, 수정 불가)
   */
  @Column('varchar', {
    unique: true,
    nullable: false,
    comment: '고유한 파일명',
  })
  filename: string;

  /**
   * 파일의 MimeType
   */
  @Column('varchar', {
    nullable: false,
    comment: 'MimeType',
  })
  mimetype: string;

  /**
   * 파일 사이즈(byte)
   */
  @Column('int', {
    nullable: false,
    comment: '파일 사이즈(byte)',
  })
  size: number;

  /**
   * 스토리지 타입 (s3, disk)
   * @example 's3'
   */
  @Column('enum', {
    enum: FileStorageEnum,
    default: 's3',
    nullable: false,
    comment: '스토리지 타입 (s3, disk)',
  })
  storage: FileStorageEnum;

  /**
   * 파일이 저장 된 경로
   * @example 'files/{branchId}/{date(YYYYMMDD)}'
   */
  @Column('varchar', {
    nullable: false,
    comment: '파일이 저장 된 경로',
  })
  path: string;

  /**
   * 파일 액세스 URL
   * @example 'https://{AWS_S3_BUCKET}.s3.{AWS_S3_REGION}.amazonaws.com/{Key}'
   */
  @Column('varchar', {
    nullable: false,
    comment: '파일 접속 URL',
  })
  url: string;

  /**
   * 마지막 액세스 일시
   */
  @Column('timestamp', {
    nullable: true,
    default: null,
    comment: '마지막 액세스 일시',
  })
  lastAccessedAt: Date | null = null;

  /**
   * 생성일시
   * default: CURRENT_TIMESTAMP
   */
  @CreateDateColumn({
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  /**
   * 수정일시
   * default CURRENT_TIMESTAMP
   * On Update CURRENT_TIMESTAMP
   */
  @UpdateDateColumn({
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  /**
   * 삭제일시
   */
  @DeleteDateColumn({
    type: 'timestamp',
    precision: 0,
    default: null,
  })
  deletedAt: Date | null = null;
}
