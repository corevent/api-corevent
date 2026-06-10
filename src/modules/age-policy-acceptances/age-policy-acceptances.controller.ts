import { Controller, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { AgePolicyAcceptancesService } from '~/modules/age-policy-acceptances/age-policy-acceptances.service'
import { AgePolicyAcceptanceResponseDto } from '~/modules/age-policy-acceptances/dto/age-policy-acceptances.dto'

@ApiTags('Age Policies - Acceptances')
@UseGuards(AuthGuard('jwt'))
@Controller('age-policies/acceptances')
export class AgePolicyAcceptancesController {
  constructor(private readonly agePolicyAcceptancesService: AgePolicyAcceptancesService) {}

  @Post()
  @ApiOperation({ summary: 'Accept the current age policy' })
  @ApiResponse({ status: 200, description: 'The age policy has been accepted', type: AgePolicyAcceptanceResponseDto })
  async acceptAgePolicy(@Req() req: AuthenticatedRequest): Promise<AgePolicyAcceptanceResponseDto> {
    return this.agePolicyAcceptancesService.acceptAgePolicy(req.user.id)
  }
}
