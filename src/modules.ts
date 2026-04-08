import { AuthModule } from '~/auth/auth.module'
import { DatabaseModule } from '~/database/database.module'
import { UsersModule } from '~/users/users.module'

export const modules = [AuthModule, DatabaseModule, UsersModule]
