import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Attractions } from '~/modules/attractions/attractions.entity'

@Injectable()
export class AttractionsService {
  constructor(
    @InjectRepository(Attractions)
    private attractionsRepository: Repository<Attractions>,
  ) {}
}
