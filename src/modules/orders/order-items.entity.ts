import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Orders } from '~/modules/orders/orders.entity'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'

@Entity()
export class OrderItems {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'order_id' })
  orderId: string

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: string

  @Column({ type: 'int' })
  quantity: number

  @ManyToOne(() => Orders, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Orders

  @ManyToOne(() => TicketTypes)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketTypes
}
