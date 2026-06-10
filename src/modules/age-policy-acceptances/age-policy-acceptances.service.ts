import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { AgePoliciesService } from '~/modules/age-policies/age-policies.service'
import { AgePolicyAcceptances } from '~/modules/age-policy-acceptances/age-policy-acceptances.entity'
import {
  AgePolicyAcceptanceDataDto,
  AgePolicyAcceptanceResponseDto,
} from '~/modules/age-policy-acceptances/dto/age-policy-acceptances.dto'

@Injectable()
export class AgePolicyAcceptancesService {
  constructor(
    @InjectRepository(AgePolicyAcceptances)
    private readonly agePolicyAcceptancesRepository: Repository<AgePolicyAcceptances>,
    private readonly agePoliciesService: AgePoliciesService,
  ) {}

  async acceptAgePolicy(userId: string): Promise<AgePolicyAcceptanceResponseDto> {
    const { data: agePolicy } = await this.agePoliciesService.getActivePolicy()
    const acceptance = this.agePolicyAcceptancesRepository.create({ userId, agePolicyId: agePolicy.id })
    const data = await this.agePolicyAcceptancesRepository.save(acceptance)
    return { data: plainToInstance(AgePolicyAcceptanceDataDto, data) }
  }
}
