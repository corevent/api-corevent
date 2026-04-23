import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { RefreshTokens } from '~/auth/refresh-tokens.entity'
import { OrganizerPaymentInfo } from '~/organizer-payment-info/organizer-payment-info.entity'

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @OneToMany(() => RefreshTokens, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokens[]

  @OneToMany(() => OrganizerPaymentInfo, (organizerPaymentInfo) => organizerPaymentInfo.user)
  organizerPaymentInfo: OrganizerPaymentInfo[]
}
