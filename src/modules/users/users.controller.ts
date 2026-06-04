import { Body, Controller, Get, InternalServerErrorException, Param, Patch, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MessageDto } from '~/common/dto/message.dto'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { UpdatePassDto, UpdateUserDto, UserResponseDto } from '~/modules/users/dto/users.dto'
import { UsersService } from '~/modules/users/users.service'

@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getById(id)
  }
}
