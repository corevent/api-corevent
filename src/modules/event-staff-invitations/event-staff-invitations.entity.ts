import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import {
  EventStaffAccessLevel,
  EventStaffInvitationStatus,
} from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { Events } from '~/modules/events-module/events.entity'
import { Users } from '~/modules/users/users.entity'

@Entity()
export class EventStaffInvitations {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({
    type: 'enum',
    enum: EventStaffInvitationStatus,
    enumName: 'event_staff_invitations_invitation_status_enum',
  })
  invitationStatus: EventStaffInvitationStatus

  @Column({
    type: 'enum',
    enum: EventStaffAccessLevel,
    enumName: 'event_staff_invitations_original_access_level_enum',
  })
  originalAccessLevel: EventStaffAccessLevel

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @OneToOne(() => EventStaff, (eventStaff) => eventStaff.staffInvitation)
  eventStaff: EventStaff

  @ManyToOne(() => Users, (user) => user.eventStaffInvitations)
  @JoinColumn({ name: 'user_id' })
  user: Users

  @ManyToOne(() => Events, (event) => event.eventStaffInvitations)
  @JoinColumn({ name: 'event_id' })
  event: Events
}
