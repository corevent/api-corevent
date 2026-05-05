import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { Cities } from '~/modules/cities/cities.entity'
import { DataCityDto, ResponseCityDto } from '~/modules/cities/dto/cities.dto'

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(Cities)
    private citiesRepository: Repository<Cities>,
  ) {}

  async getAllByStateId(stateId: number): Promise<ResponseCityDto> {
    const cities = await this.citiesRepository.find({ where: { stateId }, order: { name: 'ASC' } })
    if (cities.length === 0) {
      throw new BadRequestException('Wrong state ID')
    }
    return { data: plainToInstance(DataCityDto, cities) }
  }
}
