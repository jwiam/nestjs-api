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
import { MenuService } from './menu.service';
import {
  CreateMenuDto,
  CreateMenuResponseDto,
  GetMenuResponseDto,
  MenuIdDto,
  MenuListByAuthorityDto,
  MenuListResponseDto,
  UpdateMenuDto,
  UpdateMenuResponseDto,
} from './dto/menu.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto, ResponseErrorDto } from '../common/auth/response.dto';

@ApiTags('Menu')
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
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * 메뉴 생성
   *
   * @param {CreateMenuDto} createMenuDto - 메뉴 생성에 필요한 데이터
   * @return {Promise<CreateMenuResponseDto>} - 생성한 메뉴 정보
   */
  @ApiOperation({ summary: '메뉴 생성' })
  @Post()
  createMenu(
    @Body() createMenuDto: CreateMenuDto,
  ): Promise<CreateMenuResponseDto> {
    return this.menuService.createMenu(createMenuDto);
  }

  /**
   * 메뉴 (삭제 제외)
   *
   * @return {Promise<GetMenuResponseDto>}
   */
  @ApiOperation({ summary: '메뉴 (삭제 제외)' })
  @Get()
  getMenuNotDeleted(): Promise<GetMenuResponseDto> {
    return this.menuService.getMenuNotDeleted();
  }

  /**
   * 삭제 된 메뉴
   *
   * @return {Promise<GetMenuResponseDto>}
   */
  @ApiOperation({ summary: '삭제 된 메뉴' })
  @Get('/deleted')
  getMenuDeleted(): Promise<GetMenuResponseDto> {
    return this.menuService.getMenuDeleted();
  }

  /**
   * ID 키 값을 이용한 메뉴 업데이트
   *
   * @param {MenuIdDto} menuIdDto - 메뉴 ID 키 값
   * @param {UpdateMenuDto} updateMenuDto - 업데이트에 필요한 데이터
   * @return {Promise<UpdateMenuResponseDto>} - 업데이트 결과
   */
  @ApiOperation({ summary: '메뉴 업데이트' })
  @Patch(':id')
  updateMenuById(
    @Param() menuIdDto: MenuIdDto,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<UpdateMenuResponseDto> {
    return this.menuService.updateMenuById(menuIdDto, updateMenuDto);
  }

  /**
   * ID 키 값을 이용한 메뉴 삭제<br/>
   * deletedAt 값만 업데이트
   *
   * @param {MenuIdDto} menuIdDto - 메뉴 ID 키 값
   * @return {Promise<UpdateMenuResponseDto>} - 삭제 결과
   */
  @ApiOperation({ summary: '메뉴 삭제' })
  @Delete(':id')
  removeMenuById(
    @Param() menuIdDto: MenuIdDto,
  ): Promise<UpdateMenuResponseDto> {
    return this.menuService.removeMenuById(menuIdDto);
  }

  /**
   * 삭제 메뉴 복구<br/>
   * deletedAt 값을 null 값으로 업데이트
   *
   * @param {MenuIdDto} menuIdDto - 메뉴 ID 키 값
   * @return {Promise<UpdateMenuResponseDto>}
   */
  @ApiOperation({ summary: '삭제 메뉴 복구' })
  @Patch('/:id/restore')
  restoreMenuById(
    @Param() menuIdDto: MenuIdDto,
  ): Promise<UpdateMenuResponseDto> {
    return this.menuService.restoreMenuById(menuIdDto);
  }

  /**
   * 해당 멤버의 메뉴 권한
   *
   * @param {MenuListByAuthorityDto} menuListByAuthorityDto - 멤버의 권한 메뉴를 가져오는 데 필요한 데이터
   * @return {Promise<MenuListResponseDto>}
   */
  @ApiOperation({ summary: '해당 멤버의 메뉴 권한' })
  @Post('/member')
  @HttpCode(HttpStatus.OK)
  getMenuListByAuthority(
    @Body() menuListByAuthorityDto: MenuListByAuthorityDto,
  ): Promise<MenuListResponseDto> {
    return this.menuService.getMenuListByAuthority(menuListByAuthorityDto);
  }
}
