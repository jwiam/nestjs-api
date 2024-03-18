import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolesEnum } from '../../common/auth/roles.enum';
import { Authority } from './authority.entity';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity()
@Index('LOGIN', ['loginId'], { unique: true })
@Index('EMAIL', ['email'], { unique: true })
@Index('ROLE', ['role'])
export class Member {
  /**
   * 멤버ID 기본키<br/>
   * (Auto Increment)
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 로그인에 사용하는 ID
   * @example gildong
   */
  @Column('varchar', {
    unique: true,
    length: 20,
    nullable: false,
    comment: '로그인 아이디',
  })
  loginId: string;

  @Column('varchar', {
    unique: true,
    length: 50,
    nullable: false,
    comment: '이메일 주소',
  })
  email: string;

  /**
   * 멤버 이름
   * @example 홍길동
   */
  @Column('varchar', {
    length: 20,
    nullable: false,
    comment: '멤버 이름',
  })
  username: string;

  /**
   * 비밀번호
   * @example P@ssw0rd
   */
  @Column('varchar', {
    length: 100,
    nullable: false,
    comment: '비밀번호',
    select: false,
  })
  @ApiHideProperty()
  password: string;

  /**
   * 멤버 권한
   * @example admin
   */
  @Column('enum', {
    enum: RolesEnum,
    default: 'user',
    nullable: false,
    comment:
      '멤버 권한(admin: 관리자, user: 일반 사용자, deny: 접속 차단 된 사용자)',
  })
  role: string;

  /**
   * 리프레시 토큰
   */
  @Column('text', {
    nullable: true,
    default: null,
    select: false,
    comment: '리프레시 토큰',
  })
  @ApiHideProperty()
  refreshToken: string;

  /**
   * 이메일 검증일
   */
  @Column('timestamp', {
    nullable: true,
    default: null,
    comment: '이메일 검증일',
  })
  emailValidateAt: Date | null = null;

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
  @OneToMany(() => Authority, (authority) => authority.member)
  authority: Authority[];
}
