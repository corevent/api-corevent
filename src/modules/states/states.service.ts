import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { StateDataDto, StateResponseDto } from '~/modules/states/dto/states.dto'
import { States } from '~/modules/states/states.entity'

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(States)
    private statesRepository: Repository<States>,
  ) {}

  async getAll(): Promise<StateResponseDto> {
    const states = await this.statesRepository.find()
    return { data: plainToInstance(StateDataDto, states) }
  }
}
