import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { AgePoliciesService } from '~/modules/age-policies/age-policies.service'
import { AgePolicyAcceptances } from '~/modules/age-policy-acceptances/age-policy-acceptances.entity'
import {
  AgePolicyAcceptanceDataDto,
  AgePolicyAcceptanceResponseDto,
  CheckIfUserHasAcceptedDto,
  CheckIfUserHasAcceptedResponseDto,
} from '~/modules/age-policy-acceptances/dto/age-policy-acceptances.dto'
import { CheckIfUserHasAccepted } from '~/modules/age-policy-acceptances/interfaces/age-policy-acceptances.interface'

@Injectable()
export class AgePolicyAcceptancesService {
  constructor(
    @InjectRepository(AgePolicyAcceptances)
    private readonly agePolicyAcceptancesRepository: Repository<AgePolicyAcceptances>,
    private readonly agePoliciesService: AgePoliciesService,
  ) {}

  async acceptAgePolicy(userId: string): Promise<AgePolicyAcceptanceResponseDto> {
    const { userHasAccepted, agePolicyId } = await this.getAcceptanceStatus(userId)
    if (userHasAccepted) {
      throw new BadRequestException('User has already accepted the age policy')
    }

    const acceptance = this.agePolicyAcceptancesRepository.create({ userId, agePolicyId })
    const data = await this.agePolicyAcceptancesRepository.save(acceptance)
    return { data: plainToInstance(AgePolicyAcceptanceDataDto, data) }
  }

  async checkIfUserHasAccepted(userId: string): Promise<CheckIfUserHasAcceptedResponseDto> {
    const { userHasAccepted } = await this.getAcceptanceStatus(userId)
    return { data: plainToInstance(CheckIfUserHasAcceptedDto, { userHasAccepted }) }
  }

  private async getAcceptanceStatus(userId: string): Promise<CheckIfUserHasAccepted> {
    const { data: agePolicy } = await this.agePoliciesService.getActivePolicy()
    const acceptance = await this.agePolicyAcceptancesRepository.findOne({
      where: { userId, agePolicyId: agePolicy.id },
    })
    return { userHasAccepted: acceptance !== null, agePolicyId: agePolicy.id }
  }
}
