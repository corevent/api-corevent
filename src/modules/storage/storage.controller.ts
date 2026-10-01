import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { PresignUploadDto, PresignUploadResponseDto } from '~/modules/storage/dto/storage.dto'
import { StorageService } from '~/modules/storage/storage.service'

@ApiTags('Storage')
@UseGuards(AuthGuard('jwt'))
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign')
  @HttpCode(201)
  @ApiOperation({ summary: 'Generate a presigned URL for direct image upload to S3' })
  @ApiBody({ type: PresignUploadDto })
  @ApiCreatedResponse({ type: PresignUploadResponseDto, description: 'The presigned upload URL.' })
  @ApiBadRequestResponse({
    description: [
      'Unsupported image content type.',
      'eventId is required for event banner uploads.',
      'You are not the organizer of this event.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async presign(@Req() req: AuthenticatedRequest, @Body() body: PresignUploadDto): Promise<PresignUploadResponseDto> {
    return this.storageService.presignUpload(req.user.id, body)
  }
}
