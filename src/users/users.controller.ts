import { Body, Controller, Get, InternalServerErrorException, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { CreateUserDto, UserResponseDto } from '~/users/dto/users.dto'
import { UsersService } from '~/users/users.service'

@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 500, type: InternalServerErrorException })
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(body)
  }

  // same endpoint as /users/:id, but with the current user's ID
  @Get('me')
  @ApiOperation({ summary: 'Get the profile of the current user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.usersService.findById(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id)
  }
}
