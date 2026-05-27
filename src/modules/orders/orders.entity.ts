import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Tickets } from '../tickets/tickets.entity'

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

  @Column({ type: 'text', nullable: true })
  gatewayTransactionId?: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @OneToMany(() => Tickets, (ticket) => ticket.order)
  tickets: Tickets[]
}
