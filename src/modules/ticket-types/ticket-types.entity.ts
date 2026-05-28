import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'

@Entity()
export class TicketTypes {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  // Current quantity of tickets available for this ticket type
  @Column({ type: 'int' })
  availableQuantity: number

  // Total quantity of tickets for this ticket type
  @Column({ type: 'int' })
  totalQuantity: number

  @Column({ type: 'timestamp with time zone' })
  startDate: Date

  @Column({ type: 'timestamp with time zone' })
  endDate: Date

  @ManyToOne(() => Events, (event) => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event: Events
}
