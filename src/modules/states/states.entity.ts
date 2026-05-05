import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { Cities } from '~/modules/cities/cities.entity'

@Entity()
export class States {
  @PrimaryColumn({ type: 'int' })
  id: number

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'char', length: 2 })
  acronym: string

  @OneToMany(() => Cities, (city) => city.state)
  cities: Cities[]
}
