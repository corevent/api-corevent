import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { AgePolicies } from '~/modules/age-policies/age-policies.entity'
import { AgePolicyDataDto, AgePolicyResponseDto } from '~/modules/age-policies/dto/age-policies.dto'

@Injectable()
export class AgePoliciesService {
  constructor(
    @InjectRepository(AgePolicies)
    private readonly agePoliciesRepository: Repository<AgePolicies>,
  ) {}

  // TODO: Create methods to manage age policies using an web admin page
  // create() -> automatically deactivates the previous active policy

  async getActivePolicy(): Promise<AgePolicyResponseDto> {
    const agePolicy = await this.agePoliciesRepository.findOne({ where: { isActive: true } })
    if (!agePolicy) {
      throw new NotFoundException('No active age policy found')
    }
    return { data: plainToInstance(AgePolicyDataDto, agePolicy) }
  }
}
