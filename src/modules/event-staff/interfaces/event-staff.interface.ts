import { EventStaffAccessLevel } from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'

export interface CreateEventStaff {
  userId: string
  eventId: string
  accessLevel: EventStaffAccessLevel
  staffInvitationId: string
}
