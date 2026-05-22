import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { RefreshTokens } from '~/modules/auth/refresh-tokens.entity'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { Events } from '~/modules/events-module/events.entity'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { PasswordRecoveryCodes } from '~/modules/password-recovery-codes/password-recovery-codes.entity'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'

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
  birthDate: string

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

  @OneToMany(() => Events, (event) => event.organizer)
  events: Events[]

  @OneToMany(() => EventChanges, (eventChange) => eventChange.changedByUser)
  eventChanges: EventChanges[]

  @OneToMany(() => PasswordRecoveryCodes, (passwordRecoveryCode) => passwordRecoveryCode.user)
  passwordRecoveryCodes: PasswordRecoveryCodes[]

  @OneToMany(() => EventStaff, (eventStaff) => eventStaff.user)
  eventStaff: EventStaff[]

  @OneToMany(() => EventStaffInvitations, (eventStaffInvitation) => eventStaffInvitation.user)
  eventStaffInvitations: EventStaffInvitations[]
}
