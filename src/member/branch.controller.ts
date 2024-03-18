import { Roles } from '../common/auth/auth.decorator';
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
} from '@nestjs/common';
import { BranchService } from './branch.service';
import {
  BranchIdDto,
  BranchListByAuthorityDto,
  GetBranchResponseDto,
  CreateBranchDto,
  CreateBranchResponseDto,
  UpdateBranchDto,
  UpdateBranchResponseDto,
  BranchListResponseDto,
} from './dto/branch.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto, ResponseErrorDto } from '../common/auth/response.dto';

@ApiTags('Branch')
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
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /**
   * 지점 생성
   *
   * @param {CreateBranchDto} createBranchDto - 지점 생성에 필요한 데이터
   * @return {Promise<CreateBranchResponseDto>} - 생성한 지점 정보
   */
  @ApiOperation({ summary: '지점 생성' })
  @Post()
  createbranch(
    @Body() createBranchDto: CreateBranchDto,
  ): Promise<CreateBranchResponseDto> {
    return this.branchService.createBranch(createBranchDto);
  }

  /**
   * 지점 (삭제 제외)
   *
   * @return {Promise<GetBranchResponseDto>}
   */
  @ApiOperation({ summary: '지점 (삭제 제외)' })
  @Get()
  getBranchNotDeleted(): Promise<GetBranchResponseDto> {
    return this.branchService.getBranchNotDeleted();
  }

  /**
   * 삭제 지점
   *
   * @return {Promise<GetBranchResponseDto>}
   */
  @ApiOperation({ summary: '삭제 지점' })
  @Get('/deleted')
  getBranchDeleted(): Promise<GetBranchResponseDto> {
    return this.branchService.getBranchDeleted();
  }

  /**
   * ID 키 값을 이용한 지점 업데이트
   *
   * @param {BranchIdDto} branchIdDto - 지점 ID 키 값
   * @param {UpdateBranchDto} updateBranchDto - 업데이트에 필요한 데이터
   * @return {Promise<UpdateBranchResponseDto>} - 업데이트 결과
   */
  @ApiOperation({ summary: '지점 업데이트' })
  @Patch(':id')
  updateBranchById(
    @Param() branchIdDto: BranchIdDto,
    @Body() updateBranchDto: UpdateBranchDto,
  ): Promise<UpdateBranchResponseDto> {
    return this.branchService.updateBranchById(branchIdDto, updateBranchDto);
  }

  /**
   * ID 키 값을 이용한 지점 삭제<br/>
   * deletedAt 값만 업데이트
   *
   * @param {BranchIdDto} branchIdDto - 지점 ID 키 값
   * @return {Promise<UpdateBranchResponseDto>} - 삭제 결과
   */
  @ApiOperation({ summary: '지점 삭제' })
  @Delete(':id')
  removeBranchById(
    @Param() branchIdDto: BranchIdDto,
  ): Promise<UpdateBranchResponseDto> {
    return this.branchService.removeBranchById(branchIdDto);
  }

  /**
   * 삭제 지점 복구<br/>
   * deletedAt 값을 null 값으로 업데이트
   *
   * @param {BranchIdDto} branchIdDto - 지점 ID 키 값
   * @return {Promise<UpdateBranchResponseDto>}
   */
  @ApiOperation({ summary: '삭제 지점 복구' })
  @Patch('/:id/restore')
  restoreBranchById(
    @Param() branchIdDto: BranchIdDto,
  ): Promise<UpdateBranchResponseDto> {
    return this.branchService.restoreBranchById(branchIdDto);
  }

  /**
   * 해당 멤버의 지점 권한
   *
   * @param {BranchListByAuthorityDto} branchListByAuthorityDto - 멤버의 권한 지점을 가져오는 데 필요한 데이터
   * @return {Promise<BranchListResponseDto>}
   */
  @ApiOperation({ summary: '해당 멤버의 지점 권한' })
  @Post('/member')
  @HttpCode(HttpStatus.OK)
  getBranchListByAuthority(
    @Body() branchListByAuthorityDto: BranchListByAuthorityDto,
  ): Promise<BranchListResponseDto> {
    return this.branchService.getBranchListByAuthority(
      branchListByAuthorityDto,
    );
  }
}
