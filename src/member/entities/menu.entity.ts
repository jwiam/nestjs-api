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
export class Menu {
  /**
   * 메뉴ID 기본키<br/>
   * (Auto Increment)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 메뉴명
   * @example 지점관리
   */
  @Column('varchar', {
    length: 20,
    nullable: false,
    comment: '메뉴명',
  })
  title: string;

  /**
   * 링크 주소
   * @example /branch
   */
  @Column('varchar', {
    length: 20,
    nullable: false,
    comment: '링크 주소',
  })
  link: string;

  /**
   * 메뉴 순서
   * @example 1
   */
  @Column('integer', {
    nullable: false,
    default: 99,
    comment: '메뉴 순서',
  })
  seq: number;

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
  @OneToMany(() => Authority, (authority) => authority.menu)
  authority: Authority[];
}
