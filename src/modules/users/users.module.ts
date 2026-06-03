import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventsModule } from '~/modules/events-module/events.module'
import { RegistrationCodesModule } from '~/modules/registration-codes/registration-codes.module'
import { Users } from '~/modules/users/users.entity'
import { UsersController } from '~/modules/users/users.controller'
import { UsersService } from '~/modules/users/users.service'

@Module({
  imports: [TypeOrmModule.forFeature([Users]), RegistrationCodesModule, forwardRef(() => EventsModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
