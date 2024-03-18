import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartialType, PickType } from '@nestjs/swagger';
import { Menu } from '../entities/menu.entity';
import { ResponseDto } from '../../common/auth/response.dto';

/**
 * 메뉴 엔티티 기본 DTO
 */
export class MenuDto {
  /**
   * 메뉴명
   * @example 지점관리
   */
  @IsString({
    message: '메뉴명은 문자만 사용할 수 있습니다.',
  })
  @IsNotEmpty({
    message: '메뉴명은 빈 값이 올 수 없습니다.',
  })
  @MaxLength(20, {
    message: '메뉴명은 최대 20자 까지 가능합니다.',
  })
  title: string;

  /**
   * 링크 주소
   * @example /branch
   */
  @IsString({
    message: '링크 주소는 문자만 사용할 수 있습니다.',
  })
  @IsNotEmpty({
    message: '링크 주소는 빈 값이 올 수 없습니다.',
  })
  @MaxLength(20, {
    message: '링크 주소는 최대 20자 까지 가능합니다.',
  })
  link: string;

  /**
   * 메뉴 순서
   * @example 1
   */
  @IsInt({
    message: '메뉴 순서는 숫자값만 올 수 있습니다.',
  })
  seq: number;
}

/**
 * 메뉴 생성 DTO
 */
export class CreateMenuDto extends MenuDto {}

/**
 * (Swagger) 메뉴 생성 결과, 인터셉터 응답 포함
 */
export class CreateMenuResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: Menu;
}

/**
 * (Swagger) 메뉴 조회 결과, 인터셉터 응답 포함
 */
export class GetMenuResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: Menu[];
}

/**
 * 메뉴 업데이트 DTO
 */
export class UpdateMenuDto extends PartialType(MenuDto) {}

/**
 * (Swagger) 메뉴 업데이트 결과, 인터셉터 응답 포함
 */
export class UpdateMenuResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { affectedRows: number };
}

/**
 * 멤버 메뉴 권한 요청 DTO
 */
export class MenuListByAuthorityDto {
  /**
   * 멤버ID
   * @example 1
   */
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    {
      message: '멤버 ID 값은 숫자 형태만 올 수 있습니다.',
    },
  )
  @IsNotEmpty({
    message: '멤버 ID 값은 빈 값이 올 수 없습니다.',
  })
  memberId: number;

  /**
   * 지점ID
   * @example 1
   */
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    {
      message: '지점 ID 값은 숫자 형태만 올 수 있습니다.',
    },
  )
  @IsNotEmpty({
    message: '지점 ID 값은 빈 값이 올 수 없습니다.',
  })
  branchId: number;
}

/**
 * 메뉴 권한 중 필요 정보
 */
class MenuListResponse extends PickType(Menu, ['id', 'title', 'link', 'seq']) {}

/**
 * (Swagger) 멤버 메뉴 권한 요청 결과, 인터셉터 응답 포함
 */
export class MenuListResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: MenuListResponse[];
}

/**
 * 메뉴 ID 키 값 조회 DTO
 */
export class MenuIdDto {
  /**
   * 메뉴ID
   * @example 1
   */
  @IsNumberString(
    { no_symbols: true },
    {
      message: '메뉴 ID 값은 숫자 형태의 문자만 가능합니다.',
    },
  )
  @IsNotEmpty({
    message: '메뉴 ID 값은 빈 값이 올 수 없습니다.',
  })
  id: number;
}
