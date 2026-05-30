import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { QueryPaginationDto } from '~/common/pagination/pagination.dto'
import {
  CreateOrganizerPaymentInfoDto,
  OrganizerPaymentInfoPageDto,
  OrganizerPaymentInfoResDto,
  UpdateOrganizerPaymentInfoDto,
} from '~/modules/organizer-payment-info/dto/organizer-payment-info.dto'
import { OrganizerPaymentInfoService } from '~/modules/organizer-payment-info/organizer-payment-info.service'

@ApiTags('Organizer Payment Info')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class OrganizerPaymentInfoController {
  constructor(private readonly organizerPaymentInfoService: OrganizerPaymentInfoService) {}

  @Post(':id/organizer-payment-info')
  @ApiOperation({
    summary: 'Create organizer payment info',
    description: `Note: All fields are optional because the user may choose, for example, only PIX. 
    Therefore, it is not possible to send all values as null. 
    \nAdditionally, if the user provides one field of a type and leaves the others null, 
    a 403 error will be returned (e.g., "pixType": "cpf" and "pixKey": null).`,
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: CreateOrganizerPaymentInfoDto })
  @ApiResponse({
    status: 201,
    description: 'Organizer payment info created successfully',
    type: OrganizerPaymentInfoResDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createOrganizerPaymentInfo(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: CreateOrganizerPaymentInfoDto,
  ): Promise<OrganizerPaymentInfoResDto> {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only create your own payment info')
    }
    return this.organizerPaymentInfoService.create(id, body)
  }

  @Patch('organizer-payment-info/:id')
  @ApiOperation({ summary: 'Update organizer payment info' })
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  @ApiBody({ type: UpdateOrganizerPaymentInfoDto })
  @ApiResponse({
    status: 200,
    description: 'Organizer payment info updated successfully',
    type: OrganizerPaymentInfoResDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateOrganizerPaymentInfo(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateOrganizerPaymentInfoDto,
  ): Promise<OrganizerPaymentInfoResDto> {
    return this.organizerPaymentInfoService.update(req.user.id, id, body)
  }

  @Get(':id/organizer-payment-info')
  @ApiOperation({ summary: 'Get all organizer payment infos by user ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ type: QueryPaginationDto })
  @ApiResponse({
    status: 200,
    description: 'Organizer payment infos retrieved successfully',
    type: OrganizerPaymentInfoPageDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOrganizerPaymentInfosByUserId(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query() query: QueryPaginationDto,
  ): Promise<OrganizerPaymentInfoPageDto> {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only list your own payment info')
    }
    return this.organizerPaymentInfoService.listByUserId(id, query)
  }

  @Get('organizer-payment-info/:id')
  @ApiOperation({ summary: 'Get organizer payment info by ID' })
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  @ApiResponse({
    status: 200,
    description: 'Organizer payment info retrieved successfully',
    type: OrganizerPaymentInfoResDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOrganizerPaymentInfoById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<OrganizerPaymentInfoResDto> {
    return this.organizerPaymentInfoService.getById(req.user.id, id)
  }

  @Delete('organizer-payment-info/:id')
  @HttpCode(204)
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  @ApiOperation({ summary: 'Delete organizer payment info by ID' })
  @ApiResponse({ status: 200, description: 'Organizer payment info deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteOrganizerPaymentInfoById(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.organizerPaymentInfoService.delete(req.user.id, id)
  }
}
