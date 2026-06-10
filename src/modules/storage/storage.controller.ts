import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { PresignUploadDto, PresignUploadResponseDto } from '~/modules/storage/dto/storage.dto'
import { StorageService } from '~/modules/storage/storage.service'

@ApiTags('Storage')
@UseGuards(AuthGuard('jwt'))
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Generate a presigned URL for direct image upload to S3' })
  @ApiBody({ type: PresignUploadDto })
  @ApiResponse({ status: 201, type: PresignUploadResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request or unsupported content type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async presign(@Req() req: AuthenticatedRequest, @Body() body: PresignUploadDto): Promise<PresignUploadResponseDto> {
    return this.storageService.presignUpload(req.user.id, body)
  }
}
