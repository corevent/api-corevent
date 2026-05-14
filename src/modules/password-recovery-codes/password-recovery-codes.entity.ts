import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Users } from '~/modules/users/users.entity'

@Entity()
export class PasswordRecoveryCodes {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ type: 'text' })
  codeHash: string

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date

  @Column({ type: 'int', default: 0 })
  attempts: number

  @Column({ type: 'boolean', default: false })
  used: boolean

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => Users, (user) => user.passwordRecoveryCodes)
  user: Users
}
