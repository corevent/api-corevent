import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Users } from '~/users/users.entity'

@Entity()
export class RefreshTokens {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  tokenHash: string

  @Column({ type: 'uuid' })
  jti: string

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date

  @Column({ name: 'user_id' })
  userId: string

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => Users, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: Users
}
