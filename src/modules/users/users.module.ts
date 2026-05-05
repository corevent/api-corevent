import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Users } from '~/modules/users/users.entity'
import { UsersController } from '~/modules/users/users.controller'
import { UsersService } from '~/modules/users/users.service'

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
