import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { Events } from '~/modules/events-module/events.entity'
import { Users } from '~/modules/users/users.entity'

export enum EventStaffInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELED = 'canceled', // when the organizer cancels the invitation
}

export enum EventStaffAccessLevel {
  READONLY = 'readonly',
  CHECKIN = 'checkin',
}

@Entity()
export class EventStaffInvitations {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ type: 'enum', enum: EventStaffInvitationStatus })
  invitationStatus: EventStaffInvitationStatus

  @Column({ type: 'enum', enum: EventStaffAccessLevel })
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
