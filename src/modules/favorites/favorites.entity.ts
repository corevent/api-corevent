import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'
import { Users } from '~/modules/users/users.entity'

@Entity()
export class Favorites {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'event_id' })
  eventId: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @ManyToOne(() => Users, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: Users

  @ManyToOne(() => Events, (event) => event.favorites)
  @JoinColumn({ name: 'event_id' })
  event: Events
}
