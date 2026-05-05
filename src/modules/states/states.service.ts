import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { DataStateDto, ResponseStateDto } from '~/modules/states/dto/states.dto'
import { States } from '~/modules/states/states.entity'

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(States)
    private statesRepository: Repository<States>,
  ) {}

  async getAll(): Promise<ResponseStateDto> {
    const states = await this.statesRepository.find()
    return { data: plainToInstance(DataStateDto, states) }
  }
}
