import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'
import { Tickets } from '~/modules/tickets/tickets.entity'
import { Users } from '~/modules/users/users.entity'

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'event_id' })
  eventId: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus

  @Column({ type: 'text' })
  gatewayTransactionId: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @OneToMany(() => Tickets, (ticket) => ticket.order)
  tickets: Tickets[]

  @ManyToOne(() => Users, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: Users

  @ManyToOne(() => Events, (event) => event.orders)
  @JoinColumn({ name: 'event_id' })
  event: Events
}
