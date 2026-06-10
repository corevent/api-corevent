import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AgePoliciesService } from '~/modules/age-policies/age-policies.service'
import { AgePolicyResponseDto } from '~/modules/age-policies/dto/age-policies.dto'

@ApiTags('Age Policies')
@UseGuards(AuthGuard('jwt'))
@Controller('age-policies')
export class AgePoliciesController {
  constructor(private readonly agePoliciesService: AgePoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get the active age policy' })
  @ApiResponse({ status: 200, description: 'The active age policy', type: AgePolicyResponseDto })
  async getActivePolicy(): Promise<AgePolicyResponseDto> {
    return this.agePoliciesService.getActivePolicy()
  }
}
