import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Member } from './member.entity';
import { Menu } from './menu.entity';
import { Branch } from './branch.entity';

@Entity()
@Index('MEMBER', ['memberId'])
@Index('SEARCH_BRANCH_MENU', ['memberId', 'branchId'])
export class Authority {
  /**
   * 권한ID 기본키<br/>
   * (Auto Increment)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 지점ID 기본키
   * @example 1
   */
  @Column('integer', {
    nullable: false,
    comment: '지점ID',
  })
  branchId: number;

  /**
   * 메뉴ID 기본키
   * @example 1
   */
  @Column('integer', {
    nullable: false,
    comment: '메뉴ID',
  })
  menuId: number;

  /**
   * 멤버ID 기본키
   * @example 1
   */
  @Column('integer', {
    nullable: false,
    comment: '메뉴ID',
  })
  memberId: number;

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

  // 메뉴 로우 완전 삭제(hard delete) 할 경우 권한도 삭제
  @ManyToOne(() => Menu, {
    onDelete: 'CASCADE',
  })
  menu: Menu;

  // 지잠 로우 완전 삭제(hard delete) 할 경우 권한도 삭제
  @ManyToOne(() => Branch, {
    onDelete: 'CASCADE',
  })
  branch: Branch;

  // 멤버 로우 완전 삭제(hard delete) 할 경우 권한도 삭제
  @ManyToOne(() => Member, {
    onDelete: 'CASCADE',
  })
  member: Member;
}
