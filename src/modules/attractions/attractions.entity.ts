import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'

@Entity()
export class Attractions {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text' })
  guest: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ type: 'timestamp with time zone' })
  startDate: Date

  @Column({ type: 'timestamp with time zone' })
  endDate: Date

  @ManyToOne(() => Events, (event) => event.attractions)
  @JoinColumn({ name: 'event_id' })
  event: Events
}
