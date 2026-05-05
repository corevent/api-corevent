import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'
import { States } from '~/modules/states/states.entity'

@Entity()
export class Cities {
  @PrimaryColumn({ type: 'int' })
  id: number

  @Column({ name: 'state_id' })
  stateId: number

  @Column({ type: 'text' })
  name: string

  @ManyToOne(() => States, (state) => state.cities)
  @JoinColumn({ name: 'state_id' })
  state: States

  @OneToMany(() => Events, (event) => event.city)
  events: Events[]
}
