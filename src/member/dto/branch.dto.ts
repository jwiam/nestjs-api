import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import { PartialType, PickType } from '@nestjs/swagger';
import { Branch } from '../entities/branch.entity';
import { ResponseDto } from '../../common/auth/response.dto';

/**
 * 지점 엔티티 기본 DTO
 */
export class BranchDto {
  /**
   * 지점명
   * @example '수원 지점'
   */
  @IsString({
    message: '지점명은 문자만 사용할 수 있습니다.',
  })
  @IsNotEmpty({
    message: '지점명은 빈 값이 올 수 없습니다.',
  })
  @Length(5, 20, {
    message: '지점명은 최소 5자, 최대 20자 까지 가능합니다.',
  })
  name: string;

  /**
   * 메인 표시명
   * @example '서울 강남점'
   */
  @IsString({
    message: '메인 표시명은 문자만 사용할 수 있습니다.',
  })
  @IsNotEmpty({
    message: '메인 표시명은 빈 값이 올 수 없습니다.',
  })
  @Length(5, 20, {
    message: '메인 표시명은 최소 5자, 최대 20자 까지 가능합니다.',
  })
  title: string;

  /**
   * 홈페이지 URL
   * @example https://docs.nestjs.com
   */
  @IsString({
    message: 'URL은 문자만 사용할 수 있습니다.',
  })
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
      require_tld: true,
    },
    {
      message: 'URL은 https 를 포함한 전체 경로를 입력해주세요.',
    },
  )
  @IsNotEmpty({
    message: 'URL은 빈 값이 올 수 없습니다.',
  })
  @MaxLength(100, {
    message: 'URL은 최대 100자 까지 가능합니다.',
  })
  url: string;

  /**
   * 지점 표시 순서
   * @example 1
   */
  @IsInt({
    message: '지점 순서는 숫자만 가능합니다.',
  })
  seq: number;

  /**
   * 노출 여부
   * @example true | false
   */
  @IsBoolean({
    message: '노출 여부는 논리 자료형(Boolean)만 가능합니다.',
  })
  isShow: boolean = false;
}

/**
 * 지점 생성 DTO
 */
export class CreateBranchDto extends BranchDto {}

/**
 * (Swagger) 지점 생성 결과, 인터셉터 응답 포함
 */
export class CreateBranchResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: Branch;
}

/**
 * (Swagger) 지점 검색 결과, 인터셉터 응답 포함
 */
export class GetBranchResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: Branch[];
}

/**
 * 지점 업데이트
 */
export class UpdateBranchDto extends PartialType(BranchDto) {}

/**
 * (Swagger) 지점 업데이트 결과, 인터셉터 응답 포함
 */
export class UpdateBranchResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { affectedRows: number };
}

/**
 * 멤버 지점 권한 요청 DTO
 */
export class BranchListByAuthorityDto {
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
}

/**
 * 지점 권한 중 필요 정보
 */
class BranchListResponse extends PickType(Branch, [
  'id',
  'name',
  'title',
  'url',
  'seq',
  'isShow',
]) {}

/**
 * (Swagger) 멤버 지점 권한 요청 결과, 인터셉터 응답 포함
 */
export class BranchListResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: BranchListResponse[];
}

/**
 * 지점 ID 키 값 조회 DTO
 */
export class BranchIdDto {
  /**
   * 지점ID
   * @example 1
   */
  @IsNumberString(
    { no_symbols: true },
    {
      message: '지점 ID 값은 숫자 형태의 문자만 가능합니다.',
    },
  )
  @IsNotEmpty({
    message: '지점 ID 값은 빈 값이 올 수 없습니다.',
  })
  id: number;
}
