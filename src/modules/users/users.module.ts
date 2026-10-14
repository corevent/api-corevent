import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RegistrationCodesModule } from '~/modules/registration-codes/registration-codes.module'
import { StorageModule } from '~/modules/storage/storage.module'
import { Users } from '~/modules/users/users.entity'
import { UsersController } from '~/modules/users/users.controller'
import { UsersService } from '~/modules/users/users.service'

@Module({
  imports: [TypeOrmModule.forFeature([Users]), RegistrationCodesModule, StorageModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
