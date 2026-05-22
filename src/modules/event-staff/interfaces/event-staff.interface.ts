import { EventStaffAccessLevel } from '~/modules/event-staff-invitations/event-staff-invitations.entity'

export interface CreateEventStaff {
  userId: string
  eventId: string
  accessLevel: EventStaffAccessLevel
  staffInvitationId: string
}
