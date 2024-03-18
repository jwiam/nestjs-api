import { IsInt, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * 멤버의 지점 및 메뉴 권한 기본 DTO
 */
export class AuthorityDto {
  /**
   * 지점ID 기본키
   * @example 1
   */
  @Expose()
  @IsInt({
    message: '지점 ID 값은 숫자이어야 합니다.',
  })
  @IsNotEmpty({
    message: '지점 ID 값은 빈 값이 올 수 없습니다.',
  })
  branchId: number;

  /**
   * 메뉴ID 기본키
   * @example 1
   */
  @Expose()
  @IsInt({
    message: '메뉴 ID 값은 숫자이어야 합니다.',
  })
  @IsNotEmpty({
    message: '메뉴 ID 값은 빈 값이 올 수 없습니다.',
  })
  menuId: number;

  /**
   * 멤버ID 기본키
   * @example 1
   */
  @Expose()
  @IsInt({
    message: '멤버 ID 값은 숫자이어야 합니다.',
  })
  @IsNotEmpty({
    message: '멤버 ID 값은 빈 값이 올 수 없습니다.',
  })
  memberId: number;
}
