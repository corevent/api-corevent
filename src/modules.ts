import { DatabaseModule } from '~/database/database.module'
import { AttractionsModule } from '~/modules/attractions/attractions.module'
import { AuthModule } from '~/modules/auth/auth.module'
import { CitiesModule } from '~/modules/cities/cities.module'
import { EventChangesModule } from '~/modules/event-changes/event-changes.module'
import { EventRatingsModule } from '~/modules/event-ratings/event-ratings.module'
import { EventStaffInvitationsModule } from '~/modules/event-staff-invitations/event-staff-invitations.module'
import { EventStaffModule } from '~/modules/event-staff/event-staff.module'
import { EventsModule } from '~/modules/events-module/events.module'
import { FavoritesModule } from '~/modules/favorites/favorites.module'
import { MailModule } from '~/modules/mail/mail.module'
import { OrdersModule } from '~/modules/orders/orders.module'
import { OrganizerPaymentInfoModule } from '~/modules/organizer-payment-info/organizer-payment-info.module'
import { PagBankModule } from '~/modules/pagbank/pagbank.module'
import { PasswordRecoveryCodesModule } from '~/modules/password-recovery-codes/password-recovery-codes.module'
import { RegistrationCodesModule } from '~/modules/registration-codes/registration-codes.module'
import { StatesModule } from '~/modules/states/states.module'
import { TicketTypesModule } from '~/modules/ticket-types/ticket-types.module'
import { TicketsModule } from '~/modules/tickets/tickets.module'
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
  PasswordRecoveryCodesModule,
  MailModule,
  RegistrationCodesModule,
  EventStaffModule,
  EventStaffInvitationsModule,
  AttractionsModule,
  TicketTypesModule,
  TicketsModule,
  OrdersModule,
  PagBankModule,
  FavoritesModule,
  EventRatingsModule,
]
