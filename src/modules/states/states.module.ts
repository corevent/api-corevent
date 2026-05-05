import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StatesController } from '~/modules/states/states.controller'
import { States } from '~/modules/states/states.entity'
import { StatesService } from '~/modules/states/states.service'

@Module({
  imports: [TypeOrmModule.forFeature([States])],
  controllers: [StatesController],
  providers: [StatesService],
  exports: [StatesService],
})
export class StatesModule {}
