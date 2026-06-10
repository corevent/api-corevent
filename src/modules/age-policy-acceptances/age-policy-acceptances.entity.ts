import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AgePolicies } from '~/modules/age-policies/age-policies.entity'
import { Users } from '~/modules/users/users.entity'

@Entity()
export class AgePolicyAcceptances {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'age_policy_id' })
  agePolicyId: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @ManyToOne(() => Users, (user) => user.agePolicyAcceptances)
  @JoinColumn({ name: 'user_id' })
  user: Users

  @ManyToOne(() => AgePolicies, (agePolicy) => agePolicy.agePolicyAcceptances)
  @JoinColumn({ name: 'age_policy_id' })
  agePolicy: AgePolicies
}
