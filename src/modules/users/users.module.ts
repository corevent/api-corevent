import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Users } from '~/modules/users/users.entity'
import { UsersController } from '~/modules/users/users.controller'
import { UsersService } from '~/modules/users/users.service'
import { RegistrationCodesModule } from '~/modules/registration-codes/registration-codes.module'

@Module({
  imports: [TypeOrmModule.forFeature([Users]), RegistrationCodesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
