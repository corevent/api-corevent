import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CitiesController } from '~/modules/cities/cities.controller'
import { Cities } from '~/modules/cities/cities.entity'
import { CitiesService } from '~/modules/cities/cities.service'

@Module({
  imports: [TypeOrmModule.forFeature([Cities])],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}
