import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'
import { Orders } from '~/modules/orders/orders.entity'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { Users } from '~/modules/users/users.entity'

export enum TicketStatus {
  PENDING = 'pending',
  CHECKED_IN = 'checked_in',
  CANCELLED = 'cancelled',
}

@Entity()
export class Tickets {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'order_id' })
  orderId: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ type: 'text' })
  qrCodeHash: string

  @Column({ type: 'text' })
  qrCodeEncryptedToken: string

  @Column({ type: 'enum', enum: TicketStatus })
  status: TicketStatus

  @Column({ type: 'timestamp with time zone', nullable: true })
  checkinAt?: Date

  @Column({ name: 'checkin_by', nullable: true })
  checkinBy?: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @ManyToOne(() => Orders, (order) => order.tickets)
  @JoinColumn({ name: 'order_id' })
  order: Orders

  @ManyToOne(() => Events, (event) => event.tickets)
  @JoinColumn({ name: 'event_id' })
  event: Events

  @ManyToOne(() => Users, (user) => user.tickets)
  @JoinColumn({ name: 'user_id' })
  user: Users

  @ManyToOne(() => TicketTypes, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketTypes

  @ManyToOne(() => Users, (user) => user.checkedInTickets)
  @JoinColumn({ name: 'checkin_by' })
  checkedInByUser?: Users
}
