import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { AgePolicyAcceptancesService } from '~/modules/age-policy-acceptances/age-policy-acceptances.service'
import {
  AgePolicyAcceptanceResponseDto,
  CheckIfUserHasAcceptedResponseDto,
} from '~/modules/age-policy-acceptances/dto/age-policy-acceptances.dto'

@ApiTags('Age Policies - Acceptances')
@UseGuards(AuthGuard('jwt'))
@Controller('age-policies/acceptances')
export class AgePolicyAcceptancesController {
  constructor(private readonly agePolicyAcceptancesService: AgePolicyAcceptancesService) {}

  @Post()
  @ApiOperation({ summary: 'Accept the current age policy' })
  @ApiOkResponse({ description: 'The age policy has been accepted', type: AgePolicyAcceptanceResponseDto })
  @ApiBadRequestResponse({ description: 'User has already accepted the age policy' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'No active age policy found' })
  async acceptAgePolicy(@Req() req: AuthenticatedRequest): Promise<AgePolicyAcceptanceResponseDto> {
    return this.agePolicyAcceptancesService.acceptAgePolicy(req.user.id)
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if the user has accepted the age policy' })
  @ApiOkResponse({
    description: 'Whether the current user has accepted the active age policy',
    type: CheckIfUserHasAcceptedResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'No active age policy found' })
  async checkIfUserHasAccepted(@Req() req: AuthenticatedRequest): Promise<CheckIfUserHasAcceptedResponseDto> {
    return this.agePolicyAcceptancesService.checkIfUserHasAccepted(req.user.id)
  }
}
