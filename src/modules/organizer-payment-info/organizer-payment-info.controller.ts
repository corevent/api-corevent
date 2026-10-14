import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
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
@Controller('users/me')
export class OrganizerPaymentInfoController {
  constructor(private readonly organizerPaymentInfoService: OrganizerPaymentInfoService) {}

  @Post('organizer-payment-info')
  @ApiOperation({
    summary: 'Create organizer payment info',
    description: `Note: All fields are optional because the user may choose, for example, only PIX. 
    Therefore, it is not possible to send all values as null. 
    \nAdditionally, if the user provides one field of a type and leaves the others null, 
    a 400 error will be returned (e.g., "pixType": "cpf" and "pixKey": null).`,
  })
  @ApiBody({ type: CreateOrganizerPaymentInfoDto })
  @ApiCreatedResponse({
    description: 'Organizer payment info created successfully',
    type: OrganizerPaymentInfoResDto,
  })
  @ApiBadRequestResponse({
    description: [
      'Inform a complete payment method: bank data or PIX data (or both).',
      'User must be at least 18 years old.',
      'Invalid PIX key.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createOrganizerPaymentInfo(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateOrganizerPaymentInfoDto,
  ): Promise<OrganizerPaymentInfoResDto> {
    return this.organizerPaymentInfoService.create(req.user.id, body)
  }

  @Patch('organizer-payment-info/:id')
  @ApiOperation({ summary: 'Update organizer payment info' })
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  @ApiBody({ type: UpdateOrganizerPaymentInfoDto })
  @ApiOkResponse({
    description: 'Organizer payment info updated successfully',
    type: OrganizerPaymentInfoResDto,
  })
  @ApiBadRequestResponse({
    description: [
      'Inform a complete payment method: bank data or PIX data (or both).',
      'User must be at least 18 years old.',
      'Invalid PIX key.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not own this payment info' })
  @ApiNotFoundResponse({ description: 'Organizer payment info not found' })
  async updateOrganizerPaymentInfo(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateOrganizerPaymentInfoDto,
  ): Promise<OrganizerPaymentInfoResDto> {
    return this.organizerPaymentInfoService.update(req.user.id, id, body)
  }

  @Get('organizer-payment-info')
  @ApiOperation({ summary: 'Get all organizer payment infos of the current user' })
  @ApiOkResponse({
    description: 'Organizer payment infos retrieved successfully',
    type: OrganizerPaymentInfoPageDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getOrganizerPaymentInfosByUserId(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryPaginationDto,
  ): Promise<OrganizerPaymentInfoPageDto> {
    return this.organizerPaymentInfoService.listByUserId(req.user.id, query)
  }

  @Get('organizer-payment-info/:id')
  @ApiOperation({ summary: 'Get organizer payment info by ID' })
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  @ApiOkResponse({
    description: 'Organizer payment info retrieved successfully',
    type: OrganizerPaymentInfoResDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not own this payment info' })
  @ApiNotFoundResponse({ description: 'Organizer payment info not found' })
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
  @ApiNoContentResponse({ description: 'Organizer payment info deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not own this payment info' })
  @ApiNotFoundResponse({ description: 'Organizer payment info not found' })
  async deleteOrganizerPaymentInfoById(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.organizerPaymentInfoService.delete(req.user.id, id)
  }
}
