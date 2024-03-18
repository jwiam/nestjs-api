import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Authority } from './authority.entity';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity()
export class Branch {
  /**
   * 지점ID 기본키<br/>
   * (Auto Increment)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 지점명
   * @example '수원 지점'
   */
  @Column('varchar', {
    length: 20,
    nullable: false,
    comment: '지점명',
  })
  name: string;

  /**
   * 메인 표시명
   * @example '서울 강남점'
   */
  @Column('varchar', {
    length: 20,
    nullable: false,
    comment: '메인 표시명',
  })
  title: string;

  /**
   * 홈페이지 URL
   * @example https://docs.nestjs.com
   */
  @Column('varchar', {
    length: 100,
    nullable: false,
    comment: 'URL',
  })
  url: string;

  /**
   * 지점 표시 순서
   * @example 1
   */
  @Column('integer', {
    nullable: false,
    default: 99,
    comment: '순서',
  })
  seq: number;

  /**
   * 노출 여부
   * @example true | false
   */
  @Column('boolean', {
    nullable: false,
    default: false,
    comment: '노출 여부',
  })
  isShow: boolean = false;

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

  @ApiHideProperty()
  @OneToMany(() => Authority, (authority) => authority.branch)
  authority: Authority[];
}
