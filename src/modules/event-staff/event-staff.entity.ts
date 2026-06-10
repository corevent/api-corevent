import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EventStaffAccessLevel } from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { Events } from '~/modules/events-module/events.entity'
import { Users } from '~/modules/users/users.entity'

@Entity()
export class EventStaff {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({
    type: 'enum',
    enum: EventStaffAccessLevel,
    enumName: 'event_staff_access_level_enum',
  })
  accessLevel: EventStaffAccessLevel

  @Column({ name: 'staff_invitation_id' })
  staffInvitationId: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @ManyToOne(() => Users, (user) => user.eventStaff)
  @JoinColumn({ name: 'user_id' })
  user: Users

  @ManyToOne(() => Events, (event) => event.eventStaff)
  @JoinColumn({ name: 'event_id' })
  event: Events

  @OneToOne(() => EventStaffInvitations, (staffInvitation) => staffInvitation.eventStaff)
  @JoinColumn({ name: 'staff_invitation_id' })
  staffInvitation: EventStaffInvitations
}
