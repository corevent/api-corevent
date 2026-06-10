import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AgePolicyAcceptances } from '~/modules/age-policy-acceptances/age-policy-acceptances.entity'

@Entity()
export class AgePolicies {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'decimal', precision: 10, scale: 2, unique: true })
  version: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @OneToMany(() => AgePolicyAcceptances, (agePolicyAcceptance) => agePolicyAcceptance.agePolicy)
  agePolicyAcceptances: AgePolicyAcceptances[]
}
