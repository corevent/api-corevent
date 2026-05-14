import { AuthModule } from '~/modules/auth/auth.module'
import { DatabaseModule } from '~/database/database.module'
import { CitiesModule } from '~/modules/cities/cities.module'
import { EventChangesModule } from '~/modules/event-changes/event-changes.module'
import { EventsModule } from '~/modules/events-module/events.module'
import { OrganizerPaymentInfoModule } from '~/modules/organizer-payment-info/organizer-payment-info.module'
import { StatesModule } from '~/modules/states/states.module'
import { UsersModule } from '~/modules/users/users.module'

export const modules = [
  AuthModule,
  DatabaseModule,
  UsersModule,
  OrganizerPaymentInfoModule,
  EventsModule,
  EventChangesModule,
  StatesModule,
  CitiesModule,
]
