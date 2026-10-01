import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { MessageDto } from '~/common/dto/message.dto'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { ConfirmImageUploadDto } from '~/modules/storage/dto/storage.dto'
import { UpdatePassDto, UpdateUserDto, UserResponseDto } from '~/modules/users/dto/users.dto'
import { UsersService } from '~/modules/users/users.service'

@ApiTags('Users')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  @ApiOperation({ summary: 'Update the current user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponseDto, description: 'The user has been updated.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(req.user.id, body)
  }

  @Patch('pass')
  @ApiOperation({ summary: 'Update the password of the current user' })
  @ApiBody({ type: UpdatePassDto })
  @ApiOkResponse({ type: MessageDto, description: 'Password updated successfully' })
  @ApiBadRequestResponse({
    description: [
      'User not found.',
      'Invalid current password provided.',
      'Password must be at least 8 characters long.',
      'Password must contain at least one lowercase letter.',
      'Password must contain at least one uppercase letter.',
      'Password must contain at least one number.',
      'Password must contain at least one special character.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updatePass(@Req() req: AuthenticatedRequest, @Body() body: UpdatePassDto): Promise<{ message: string }> {
    return this.usersService.updatePass(req.user.id, body)
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Confirm avatar upload and save the image URL' })
  @ApiBody({ type: ConfirmImageUploadDto })
  @ApiOkResponse({ type: UserResponseDto, description: 'The avatar URL has been saved.' })
  @ApiBadRequestResponse({ description: 'Invalid avatar upload key. Uploaded image not found in storage' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async updateAvatar(@Req() req: AuthenticatedRequest, @Body() body: ConfirmImageUploadDto): Promise<UserResponseDto> {
    return this.usersService.updateAvatar(req.user.id, body.key)
  }

  // same endpoint as /users/:id, but with the current user's ID
  @Get('me')
  @ApiOperation({ summary: 'Get the profile of the current user' })
  @ApiOkResponse({ type: UserResponseDto, description: 'The profile of the current user.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProfile(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.usersService.getById(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiOkResponse({ type: UserResponseDto, description: 'The user profile.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getById(id)
  }
}
