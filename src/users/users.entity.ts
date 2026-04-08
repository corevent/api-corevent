import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { RefreshTokens } from '~/auth/refresh-tokens.entity'

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'text', unique: true })
  email: string

  @Column({ type: 'char', length: 11, unique: true })
  cpf: string

  @Column({ type: 'date' })
  birthDate: Date

  @Column({ type: 'text' })
  passwordHash: string

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @OneToMany(() => RefreshTokens, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokens[]
}
