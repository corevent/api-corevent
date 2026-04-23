import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PaginationPipe } from '~/common/pipes/pagination.pipe'
import type { Pagination } from '~/common/pagination/pagination.interface'
import {
  CreateOrganizerPaymentInfoDto,
  OrganizerPaymentInfoPageDto,
  ResOrganizerPaymentInfoDto,
} from '~/organizer-payment-info/dto/organizer-payment-info.dto'
import { OrganizerPaymentInfoService } from '~/organizer-payment-info/organizer-payment-info.service'

@ApiTags('Organizer Payment Info')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class OrganizerPaymentInfoController {
  constructor(private readonly organizerPaymentInfoService: OrganizerPaymentInfoService) {}

  @Post(':id/organizer-payment-info')
  @ApiOperation({ summary: 'Create organizer payment info' })
  @ApiResponse({
    status: 201,
    description: 'Organizer payment info created successfully',
    type: ResOrganizerPaymentInfoDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: CreateOrganizerPaymentInfoDto })
  async createOrganizerPaymentInfo(
    @Param('id') id: string,
    @Body() body: CreateOrganizerPaymentInfoDto,
  ): Promise<ResOrganizerPaymentInfoDto> {
    return this.organizerPaymentInfoService.create(id, body)
  }

  @Put('organizer-payment-info/:id')
  @ApiOperation({ summary: 'Update organizer payment info' })
  @ApiResponse({
    status: 200,
    description: 'Organizer payment info updated successfully',
    type: ResOrganizerPaymentInfoDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  @ApiBody({ type: CreateOrganizerPaymentInfoDto })
  async updateOrganizerPaymentInfo(
    @Param('id') id: string,
    @Body() body: CreateOrganizerPaymentInfoDto,
  ): Promise<ResOrganizerPaymentInfoDto> {
    return this.organizerPaymentInfoService.update(id, body)
  }

  @Get(':id/organizer-payment-info')
  @ApiOperation({ summary: 'Get all organizer payment infos by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Organizer payment infos retrieved successfully',
    type: OrganizerPaymentInfoPageDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'currentPage' })
  @ApiQuery({ name: 'itemsPerPage' })
  async getOrganizerPaymentInfosByUserId(
    @Param('id') id: string,
    @Query(PaginationPipe) pagination: Pagination,
  ): Promise<OrganizerPaymentInfoPageDto> {
    return this.organizerPaymentInfoService.listByUserId(id, pagination)
  }

  @Get('organizer-payment-info/:id')
  @ApiOperation({ summary: 'Get organizer payment info by ID' })
  @ApiResponse({
    status: 200,
    description: 'Organizer payment info retrieved successfully',
    type: ResOrganizerPaymentInfoDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  async getOrganizerPaymentInfoById(@Param('id') id: string): Promise<ResOrganizerPaymentInfoDto> {
    return this.organizerPaymentInfoService.getById(id)
  }

  @Delete('organizer-payment-info/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete organizer payment info by ID' })
  @ApiResponse({ status: 200, description: 'Organizer payment info deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', description: 'Organizer payment info ID' })
  async deleteOrganizerPaymentInfoById(@Param('id') id: string): Promise<void> {
    return this.organizerPaymentInfoService.delete(id)
  }
}
