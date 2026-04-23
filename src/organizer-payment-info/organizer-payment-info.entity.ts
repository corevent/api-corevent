import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Users } from '~/users/users.entity'

@Entity()
export class OrganizerPaymentInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', nullable: false })
  description: string

  @Column({ type: 'varchar', length: 4, nullable: true })
  branchNumber?: string

  @Column({ type: 'varchar', length: 1, nullable: true })
  branchDigit?: string

  @Column({ type: 'varchar', length: 10, nullable: true })
  accountNumber?: string

  @Column({ type: 'varchar', length: 1, nullable: true })
  accountDigit?: string

  @Column({ type: 'text', nullable: true })
  pixKey?: string

  @Column({ type: 'enum', enum: ['cpf', 'cnpj', 'email', 'phone', 'random'], nullable: true })
  pixType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'

  @Column({ type: 'varchar', length: 10, nullable: true })
  bankCode?: string

  @Column({ name: 'user_id' })
  userId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => Users, (user) => user.organizerPaymentInfo)
  user: Users
}
