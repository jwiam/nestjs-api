import {
  IsAlphanumeric,
  IsArray,
  IsEmail,
  IsJWT,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Member } from '../entities/member.entity';
import { ResponseDto } from '../../common/auth/response.dto';
import { Authority } from '../entities/authority.entity';
import { Menu } from '../entities/menu.entity';
import { Branch } from '../entities/branch.entity';
import { Type } from 'class-transformer';

/**
 * 멤버 엔티티 기본 DTO
 */
export class MemberDto {
  /**
   * 로그인에 사용하는 ID
   * @example gildong
   */
  @IsAlphanumeric('en-US', {
    message: '아이디는 알파벳이나 숫자만 가능합니다.',
  })
  @IsNotEmpty({
    message: '아이디를 입력해주세요.',
  })
  @MaxLength(20, {
    message: '아이디는 최대 20자 까지 가능합니다.',
  })
  loginId: string;

  /**
   * 이메일 주소
   * @example example@example.com
   */
  @IsEmail(
    {},
    {
      message: '이메일 형식이 올바르지 않습니다.',
    },
  )
  @IsNotEmpty({
    message: '이메일을 입력해주세요.',
  })
  @MaxLength(50, {
    message: '이메일은 최대 50자 까지 가능합니다.',
  })
  email: string;

  /**
   * 멤버 이름
   * @example 홍길동
   */
  @IsString({
    message: '이름은 문자만 사용할 수 있습니다.',
  })
  @IsNotEmpty({
    message: '이름을 입력해주세요.',
  })
  @MaxLength(20, {
    message: '이름은 최대 20자 까지 가능합니다.',
  })
  username: string;

  /**
   * 비밀번호<br/>
   * 숫자 및 대/소/특수문자 각각 최소 1개 이상 필요
   *
   * @example P@ssw0rd
   */
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minLowercase: 1,
      minUppercase: 1,
    },
    {
      message: '숫자, 특수문자, 소문자, 대문자 각각 1개 이상 입력해주세요.',
    },
  )
  @IsNotEmpty({
    message: '패스워드는 빈 값이 올 수 없습니다.',
  })
  @Length(8, 100, {
    message: '패스워드는 최소 8자, 최대 100자 까지 가능합니다.',
  })
  password: string;
}

/**
 * 회원가입에 필요한 데이터
 */
export class SignUpDto extends MemberDto {
  /**
   * 지점 IDs
   * @example [1, 2, 3]
   */
  @IsArray({
    message: '지점 ID 값은 배열 형태이어야 합니다.',
  })
  @IsOptional()
  branchIds?: number[] = [];

  /**
   * 메뉴 IDs
   * @example [1, 2, 3]
   */
  @IsArray({
    message: '메뉴 ID 값은 배열 형태이어야 합니다.',
  })
  @IsOptional()
  menuIds?: number[] = [];
}

/**
 * (Swagger) 회원가입 응답메시지
 */
class SignUpResponseMessage extends IntersectionType(
  OmitType(Member, ['password']),
  OmitType(SignUpDto, ['password']),
) {}

/**
 * (Swagger) 회원가입 응답메시지, 인터셉터 응답 포함
 */
export class SignUpResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: SignUpResponseMessage;
}

/**
 * 이메일 검증 토큰 발송 DTO
 */
export class SendValidationDto extends PickType(MemberDto, [
  'email',
  'username',
]) {}

/**
 * 이메일 발송 결과 DTO
 */
export class EmailResultDto {
  /**
   * 이메일 발송 성공 리스트
   * @example ['example01@example.com', 'example02@example.com']
   */
  @IsEmail({}, { each: true, message: '이메일 형식이 올바르지 않습니다.' })
  accepted: string[];

  /**
   * 이메일 발송 실패 리스트
   * @example ['example01@example.com', 'example02@example.com']
   */
  @IsEmail({}, { each: true, message: '이메일 형식이 올바르지 않습니다.' })
  rejected: string[];

  /**
   * 이메일 발송 소요시간
   */
  @IsNumber()
  messageTile: number;

  /**
   * 발송한 이메일 크기
   */
  @IsNumber()
  messageSize: number;

  /**
   * 결과 메시지
   */
  @IsString()
  response: string;
}

/**
 * (Swagger) 이메일 검증 토큰 발송 결과, 인터셉터 응답 포함
 */
export class SendValidationResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: EmailResultDto;
}

/**
 * 이메일 검증 DTO
 */
export class EmailValidateDto {
  @IsJWT({
    message: '이메일 검증 토큰이 jwt 형태가 아닙니다.',
  })
  token: string;
}

/**
 * (Swagger) 이메일 검증 후 업데이트 결과, 인터셉터 응답 포함
 */
export class EmailValidateResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { affectedRows: number };
}

/**
 * 로그인 DTO
 */
export class LoginDto extends PickType(MemberDto, ['loginId', 'password']) {}

/**
 * (Swagger) 로그인 결과, 인터셉터 응답 포함
 */
export class LoginResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { accessToken: string; refreshToken: string };
}

/**
 * 아이디 중복체크 (삭제 포함) DTO
 */
export class ConfirmIdDto extends PickType(MemberDto, ['loginId']) {}

/**
 * (Swagger) 아이디 중복체크 (삭제 포함) 결과, 인터셉터 응답 포함
 */
export class ConfirmIdResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { isDuplicated: boolean };
}

/**
 * 이메일 중복체크 (삭제 포함) DTO
 */
export class ConfirmEmailDto extends PickType(MemberDto, ['email']) {}

/**
 * (Swagger) 이메일 중복체크 (삭제 포함) 결과, 인터셉터 응답 포함
 */
export class ConfirmEmailResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { isDuplicated: boolean };
}

/**
 * (Swagger) 멤버 수 카운트 결과, 인터셉터 응답 포함
 */
export class MemberCountResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { count: number };
}

/**
 * (Swagger) 멤버 리스트 결과, 인터셉터 응답 포함
 */
export class MemberListResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: Member[];
}

/**
 * 멤버 정보 중 메뉴 권한
 */
class AuthorityMenuResponse extends PickType(Menu, [
  'id',
  'title',
  'link',
  'seq',
]) {}

/**
 * 멤버 정보 중 브랜치 권한
 */
class AuthorityBranchResponse extends PickType(Branch, [
  'id',
  'name',
  'title',
  'url',
  'seq',
]) {}

/**
 * 멤버 정보 중 권한 상세내용
 */
class AuthorityResponseMessage extends PickType(Authority, ['id']) {
  id: number;
  menu: AuthorityMenuResponse;
  branch: AuthorityBranchResponse;
}

/**
 * 멤버 및 권한 정보
 */
class MemberResponseMessage extends OmitType(Member, ['authority']) {
  id: number;
  loginId: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null = null;
  authority: AuthorityResponseMessage[];
}

/**
 * (Swagger) 멤버 정보 결과, 인터셉터 응답 포함
 */
export class MemberResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: MemberResponseMessage;
}

/**
 * 멤버 업데이트 DTO
 */
export class UpdateMemberDto extends PartialType(
  OmitType(SignUpDto, ['loginId']),
) {}

/**
 * (Swagger) 멤버 업데이트 결과, 인터셉터 응답 포함
 */
export class UpdateMemberResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { affectedRows: number };
}

/**
 * 멤버 ID 키 값 조회 DTO
 */
export class MemberIdDto {
  /**
   * 멤버ID
   * @example 1
   */
  @IsNumberString(
    { no_symbols: true },
    {
      message: '멤버 ID 값은 숫자 형태의 문자만 가능합니다.',
    },
  )
  @IsNotEmpty({
    message: '멤버 ID 값은 빈 값이 올 수 없습니다.',
  })
  id: number;
}

/**
 * 멤버 리스트 페이징 DTO
 */
export class MemberListPageDto {
  /**
   * 페이지 번호 (최소 1 이상)
   * @example 1
   */
  @IsOptional()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    {
      message: '페이지 번호는 숫자 형태만 올 수 있습니다.',
    },
  )
  @Type(() => Number)
  @Min(1, {
    message: '최소 1 이상으로 입력해야 합니다.',
  })
  page?: number = 1;

  /**
   * 페이지 당 표시 할 개수 (최소 1, 최대 100)
   * @example 10
   */
  @IsOptional()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    {
      message: '페이지 당 표시 할 개수는 숫자 형태만 올 수 있습니다.',
    },
  )
  @Type(() => Number)
  @Min(1, {
    message: '최소 1 까지 입력 가능합니다.',
  })
  @Max(100, {
    message: '최대 100 까지 입력 가능합니다.',
  })
  perPage?: number = 10;
}

/**
 * 액세스 토큰 재발급 요청 DTO
 */
export class MemberRefreshDto {
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
  id: number;

  /**
   * 로그인 시 발급 된 리프레시 토큰
   */
  @IsJWT({
    message: '리프레시 토큰이 jwt 형태가 아닙니다.',
  })
  refreshToken: string;
}

/**
 * (Swagger) 액세스 토큰 재발급 요청 결과, 인터셉터 응답 포함
 */
export class MemberRefreshResponseDto extends PartialType(ResponseDto) {
  result: boolean;
  statusCode: number;
  request: string;
  timestamp: string;
  message: { accessToken: string };
}
