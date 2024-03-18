import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { Public, Roles } from 'src/common/auth/auth.decorator';
import {
  ConfirmEmailDto,
  ConfirmEmailResponseDto,
  ConfirmIdDto,
  ConfirmIdResponseDto,
  EmailValidateDto,
  EmailValidateResponseDto,
  LoginDto,
  LoginResponseDto,
  MemberCountResponseDto,
  MemberIdDto,
  MemberListPageDto,
  MemberListResponseDto,
  MemberRefreshDto,
  MemberRefreshResponseDto,
  MemberResponseDto,
  SendValidationDto,
  SendValidationResponseDto,
  SignUpDto,
  SignUpResponseDto,
  UpdateMemberDto,
  UpdateMemberResponseDto,
} from './dto/member.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto, ResponseErrorDto } from '../common/auth/response.dto';
import { Request } from 'express';

@ApiTags('Members')
@ApiResponse({
  status: '4XX',
  type: ResponseErrorDto,
  description:
    '4XX 및 5XX 에러 메시지는 message.error 객체로 확인<br/>민감한 에러 메시지는 상세하게 기술하지 않음',
})
@ApiResponse({
  status: '2XX',
  type: ResponseDto,
  description: '2XX Response 값은 message 객체에서 확인',
})
@Roles('admin')
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /**
   * 회원가입
   *
   * @param {SignUpDto} signUpDto - 회원가입에 필요한 데이터
   * @return {Promise<SignUpResponseDto>}
   */
  @ApiOperation({ security: [], summary: '회원가입' })
  @Public()
  @Post()
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    return await this.memberService.signUp(signUpDto);
  }

  /**
   * 이메일 검증 토큰 발송
   *
   * @param {SendValidationDto} sendValidationDto
   * @param {Request} request
   * @return {Promise<SendValidationResponseDto>}
   */
  @ApiOperation({ summary: '이메일 검증 토큰 발송' })
  @Post('validation')
  async sendValidation(
    @Body() sendValidationDto: SendValidationDto,
    @Req() request: Request,
  ): Promise<SendValidationResponseDto> {
    return await this.memberService.sendValidation(sendValidationDto, request);
  }

  /**
   * 이메일 검증
   *
   * @param {EmailValidateDto} emailValidateDto
   * @return {Promise<EmailValidateResponseDto>}
   */
  @ApiOperation({ security: [], summary: '이메일 검증' })
  @Public()
  @Get('validate/:token')
  async emailValidate(
    @Param() emailValidateDto: EmailValidateDto,
  ): Promise<EmailValidateResponseDto> {
    return await this.memberService.emailValidate(emailValidateDto);
  }

  /**
   * 로그인
   *
   * @param {LoginDto} loginDto - 로그인에 필요한 데이터
   * @return {Promise<LoginResponseDto>} - 토큰 발급
   */
  @ApiOperation({ security: [], summary: '로그인' })
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.memberService.login(loginDto);
  }

  /**
   * 액세스 토큰 재발급 요청<br/>
   * 리프레시 토큰이 유효한 경우에 재발급
   *
   * @param {MemberRefreshDto} memberRefreshDto - 멤버 ID 키 값
   * @return {Promise<MemberRefreshResponseDto>} - 액세스 토큰 재발급
   */
  @ApiOperation({
    security: [],
    summary: '토큰 재발급 요청(리프레시 토큰 사용)',
  })
  @Public()
  @Post('refresh')
  refresh(
    @Body() memberRefreshDto: MemberRefreshDto,
  ): Promise<MemberRefreshResponseDto> {
    return this.memberService.refresh(memberRefreshDto);
  }

  /**
   * 아이디 중복체크 (삭제 포함)
   *
   * @param {ConfirmIdDto} confirmId - 중복체크에 필요한 데이터
   * @return {Promise<ConfirmIdResponseDto>} - 중복 여부
   */
  @ApiOperation({ security: [], summary: '아이디 중복체크' })
  @Public()
  @Post('/duplicated/id')
  @HttpCode(HttpStatus.OK)
  idDuplicatedId(
    @Body() confirmId: ConfirmIdDto,
  ): Promise<ConfirmIdResponseDto> {
    return this.memberService.idDuplicatedId(confirmId);
  }

  /**
   * 이메일 중복체크 (삭제 포함)
   *
   * @param {ConfirmEmailDto} confirmEmail - 중복체크에 필요한 데이터
   * @return {Promise<ConfirmEmailResponseDto>} - 중복 여부
   */
  @ApiOperation({ security: [], summary: '이메일 중복체크' })
  @Public()
  @Post('/duplicated/email')
  @HttpCode(HttpStatus.OK)
  idDuplicated(
    @Body() confirmEmail: ConfirmEmailDto,
  ): Promise<ConfirmEmailResponseDto> {
    return this.memberService.idDuplicatedEmail(confirmEmail);
  }

  /**
   * 삭제되지 않은 멤버 수
   *
   * @return {Promise<MemberCountResponseDto>}
   */
  @ApiOperation({ summary: '삭제되지 않은 멤버 수' })
  @Get('/count')
  getMemberCount(): Promise<MemberCountResponseDto> {
    return this.memberService.getMemberCount();
  }

  /**
   * 삭제 된 멤버 수
   *
   * @return {Promise<MemberCountResponseDto>}
   */
  @ApiOperation({ summary: '삭제 된 멤버 수' })
  @Get('/count/deleted')
  getDeletedMemberCount(): Promise<MemberCountResponseDto> {
    return this.memberService.getDeletedMemberCount();
  }

  /**
   * 페이지당 멤버 리스트 (삭제 멤버 제외)
   *
   * @param {MemberListPageDto} memberListPageDto - 페이지 번호 및 페이지당 표시 할 멤버 수
   * @return {Promise<MemberListResponseDto>}
   */
  @ApiOperation({ summary: '페이지당 멤버 리스트 (삭제 멤버 제외)' })
  @Get()
  getMemberListPerPage(
    @Query() memberListPageDto: MemberListPageDto,
  ): Promise<MemberListResponseDto> {
    return this.memberService.getMemberListPerPage(memberListPageDto);
  }

  /**
   * 페이지당 삭제 멤버 리스트
   *
   * @param {MemberListPageDto} memberListPageDto - 페이지 번호 및 페이지당 표시 할 멤버 수
   * @return {Promise<MemberListResponseDto>}
   */
  @ApiOperation({ summary: '페이지당 삭제 멤버 리스트' })
  @Get('/deleted')
  getDeletedMemberListPerPage(
    @Query() memberListPageDto: MemberListPageDto,
  ): Promise<MemberListResponseDto> {
    return this.memberService.getDeletedMemberListPerPage(memberListPageDto);
  }

  /**
   * 멤버 정보<br/>
   * 메뉴 및 지점 권한 정보도 포함
   *
   * @param {MemberIdDto} memberIdDto - 멤버 ID 키 값
   * @return {Promise<MemberResponseDto>}
   */
  @ApiOperation({ summary: '멤버 정보' })
  @Get(':id')
  getMemberById(@Param() memberIdDto: MemberIdDto): Promise<MemberResponseDto> {
    return this.memberService.getMemberById(memberIdDto);
  }

  /**
   * ID 키 값을 이용한 멤버 업데이트
   *
   * @param {MemberIdDto} memberIdDto - 멤버 ID 키 값
   * @param {UpdateMemberDto} updateMemberDto - 업데이트에 필요한 데이터
   * @return {Promise<UpdateMemberResponseDto>} - 업데이트 결과
   */
  @ApiOperation({ summary: '멤버 업데이트' })
  @Patch(':id')
  updateMemberById(
    @Param() memberIdDto: MemberIdDto,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<UpdateMemberResponseDto> {
    return this.memberService.updateMemberById(memberIdDto, updateMemberDto);
  }

  /**
   * ID 키 값을 이용한 맴버 삭제<br/>
   * deletedAt 값만 업데이트
   *
   * @param {MemberIdDto} memberIdDto - 멤버 ID 키 값
   * @param {Request} request
   * @return {Promise<UpdateMemberResponseDto>} - 삭제 결과
   */
  @ApiOperation({ summary: '멤버 삭제' })
  @Delete(':id')
  removeMemberById(
    @Param() memberIdDto: MemberIdDto,
    @Req() request: Request,
  ): Promise<UpdateMemberResponseDto> {
    return this.memberService.removeMemberById(
      memberIdDto,
      request.headers.authorization,
    );
  }

  /**
   * 삭제 멤버 복구<br/>
   * deletedAt 값을 null 값으로 업데이트
   *
   * @param {MemberIdDto} memberIdDto - 멤버 ID 키 값
   * @return {Promise<UpdateMemberResponseDto>}
   */
  @ApiOperation({ summary: '삭제 멤버 복구' })
  @Patch('/:id/restore')
  restoreMemberById(
    @Param() memberIdDto: MemberIdDto,
  ): Promise<UpdateMemberResponseDto> {
    return this.memberService.restoreMemberById(memberIdDto);
  }
}
