import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { RefreshTokens } from '~/modules/auth/refresh-tokens.entity'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { Events } from '~/modules/events-module/events.entity'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { PasswordRecoveryCodes } from '~/modules/password-recovery-codes/password-recovery-codes.entity'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { Orders } from '~/modules/orders/orders.entity'
import { Favorites } from '~/modules/favorites/favorites.entity'
import { EventRatings } from '~/modules/event-ratings/event-ratings.entity'
import { Tickets } from '~/modules/tickets/tickets.entity'
import { AgePolicyAcceptances } from '~/modules/age-policy-acceptances/age-policy-acceptances.entity'
import { DocumentType } from '~/modules/users/enums/document-type.enum'

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'text', unique: true })
  email: string

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType

  @Column({ type: 'char', length: 14, unique: true })
  document: string

  @Column({ type: 'date' })
  birthDate: string

  @Column({ type: 'text' })
  passwordHash: string

  @Column({ type: 'text', nullable: true })
  phoneNumber?: string

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

  @OneToMany(() => Orders, (order) => order.user)
  orders: Orders[]

  @OneToMany(() => Favorites, (favorite) => favorite.user)
  favorites: Favorites[]

  @OneToMany(() => EventRatings, (eventRating) => eventRating.user)
  eventRatings: EventRatings[]

  @OneToMany(() => Tickets, (ticket) => ticket.user)
  tickets: Tickets[]

  @OneToMany(() => Tickets, (ticket) => ticket.checkedInByUser)
  checkedInTickets: Tickets[]

  @OneToMany(() => AgePolicyAcceptances, (agePolicyAcceptance) => agePolicyAcceptance.user)
  agePolicyAcceptances: AgePolicyAcceptances[]
}
