import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'
import { Users } from '~/modules/users/users.entity'

@Entity()
export class EventChanges {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ type: 'text', array: true })
  changedFields: string[]

  @Column({ type: 'jsonb' })
  oldValue: Record<string, any>

  @Column({ type: 'jsonb' })
  newValue: Record<string, any>

  @Column({ name: 'changed_by' })
  changedByUserId: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @ManyToOne(() => Events, (event) => event.eventChanges)
  @JoinColumn({ name: 'event_id' })
  event: Events

  @ManyToOne(() => Users, (user) => user.eventChanges)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: Users
}
