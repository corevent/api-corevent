import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MessageDto } from '~/common/dto/message.dto'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { PaginateEventsDto, QueryEventsDto } from '~/modules/events-module/dto/events.dto'
import { EventsService } from '~/modules/events-module/events.service'
import { UpdatePassDto, UpdateUserDto, UserResponseDto } from '~/modules/users/dto/users.dto'
import { UsersService } from '~/modules/users/users.service'

@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
  ) {}

  @Patch()
  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 500, type: InternalServerErrorException })
  async update(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(req.user.id, body)
  }

  @Patch('pass')
  @ApiOperation({ summary: 'Update the password of the current user' })
  @ApiBody({ type: UpdatePassDto })
  @ApiResponse({ status: 200, type: MessageDto })
  @ApiResponse({ status: 400, description: 'Invalid current password provided' })
  @ApiResponse({ status: 500, type: InternalServerErrorException })
  async updatePass(@Req() req: AuthenticatedRequest, @Body() body: UpdatePassDto): Promise<{ message: string }> {
    return this.usersService.updatePass(req.user.id, body)
  }

  // same endpoint as /users/:id, but with the current user's ID
  @Get('me')
  @ApiOperation({ summary: 'Get the profile of the current user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.usersService.getById(req.user.id)
  }

  @Get('my-events')
  @ApiOperation({ summary: 'Get the events of the current user' })
  @ApiQuery({ type: QueryEventsDto })
  @ApiResponse({ status: 200, type: PaginateEventsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEvents(@Req() req: AuthenticatedRequest, @Query() query: QueryEventsDto): Promise<PaginateEventsDto> {
    return this.eventsService.getAll(query, req.user.id)
  }

  @Get('my-staff-events')
  @ApiOperation({ summary: 'Get the events where the current user is a staff' })
  @ApiQuery({ type: QueryEventsDto })
  @ApiResponse({ status: 200, type: PaginateEventsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStaffEvents(@Req() req: AuthenticatedRequest, @Query() query: QueryEventsDto): Promise<PaginateEventsDto> {
    return this.eventsService.getAll(query, req.user.id, 'staff')
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getById(id)
  }
}
