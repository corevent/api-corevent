import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Cities } from '~/modules/cities/cities.entity'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { Users } from '~/modules/users/users.entity'

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  GOING = 'going',
  CANCELED = 'canceled',
  FINISHED = 'finished',
}

@Entity()
export class Events {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'organizer_id' })
  organizerId: string

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'int', nullable: true })
  maxParticipants: number

  @Column({ name: 'city_id', nullable: true })
  cityId?: number

  @Column({ type: 'varchar', length: 8, nullable: true })
  zipCode?: string

  @Column({ type: 'text', nullable: true })
  neighborhood?: string

  @Column({ type: 'text', nullable: true })
  street?: string

  @Column({ type: 'int', nullable: true })
  number?: number

  @Column({ type: 'text', nullable: true })
  complement?: string

  @Column({ type: 'timestamp with time zone' })
  startDate: Date

  @Column({ type: 'timestamp with time zone' })
  endDate: Date

  @Column({ type: 'text', nullable: true })
  bannerUrl?: string

  @Column({ type: 'boolean', default: false })
  isAdultOnly: boolean

  @Column({ name: 'event_changes_id', nullable: true })
  eventChangesId?: string

  // Limit date for refund when event is changed (does not include CDC regret purchase rule)
  @Column({ type: 'timestamp with time zone', nullable: true })
  changeRefundDeadline?: Date

  @Column({ type: 'enum', enum: EventStatus })
  status: EventStatus

  @ManyToOne(() => Users, (user) => user.events)
  @JoinColumn({ name: 'organizer_id' })
  organizer: Users

  @ManyToOne(() => Cities, (city) => city.events)
  @JoinColumn({ name: 'city_id' })
  city: Cities

  @OneToMany(() => EventChanges, (eventChange) => eventChange.event)
  @JoinColumn({ name: 'event_changes_id' })
  eventChanges: EventChanges[]
}
