import { AuthModule } from '~/modules/auth/auth.module'
import { DatabaseModule } from '~/database/database.module'
import { CitiesModule } from '~/modules/cities/cities.module'
import { EventChangesModule } from '~/modules/event-changes/event-changes.module'
import { EventsModule } from '~/modules/events-module/events.module'
import { OrganizerPaymentInfoModule } from '~/modules/organizer-payment-info/organizer-payment-info.module'
import { StatesModule } from '~/modules/states/states.module'
import { UsersModule } from '~/modules/users/users.module'
import { PasswordRecoveryCodesModule } from '~/modules/password-recovery-codes/password-recovery-codes.module'
import { MailModule } from '~/modules/mail/mail.module'
import { RegistrationCodesModule } from '~/modules/registration-codes/registration-codes.module'
import { EventStaffModule } from '~/modules/event-staff/event-staff.module'
import { EventStaffInvitationsModule } from '~/modules/event-staff-invitations/event-staff-invitations.module'
import { AttractionsModule } from '~/modules/attractions/attractions.module'

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
]
