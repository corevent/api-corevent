import { Attractions } from '~/modules/attractions/attractions.entity'
import { RefreshTokens } from '~/modules/auth/refresh-tokens.entity'
import { Cities } from '~/modules/cities/cities.entity'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { Events } from '~/modules/events-module/events.entity'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { PasswordRecoveryCodes } from '~/modules/password-recovery-codes/password-recovery-codes.entity'
import { RegistrationCodes } from '~/modules/registration-codes/registration-codes.entity'
import { States } from '~/modules/states/states.entity'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { Tickets } from '~/modules/tickets/tickets.entity'
import { Users } from '~/modules/users/users.entity'
import { Orders } from '~/modules/orders/orders.entity'

export const entities = [
  Users,
  RefreshTokens,
  OrganizerPaymentInfo,
  States,
  Cities,
  Events,
  EventChanges,
  PasswordRecoveryCodes,
  RegistrationCodes,
  EventStaff,
  EventStaffInvitations,
  Attractions,
  TicketTypes,
  Tickets,
  Orders,
]
