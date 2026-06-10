import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Attractions } from '~/modules/attractions/attractions.entity'
import { Cities } from '~/modules/cities/cities.entity'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { EventRatings } from '~/modules/event-ratings/event-ratings.entity'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { Favorites } from '~/modules/favorites/favorites.entity'
import { Orders } from '~/modules/orders/orders.entity'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { Tickets } from '~/modules/tickets/tickets.entity'
import { Users } from '~/modules/users/users.entity'

export enum EventStatus {
  DRAFT = 'draft',
  OPENED = 'opened',
  GOING = 'going',
  CANCELED = 'canceled',
  FINISHED = 'finished',
}

export enum EventCategory {
  MUSIC = 'music',
  SPORTS = 'sports',
  TECH = 'tech',
  BUSINESS = 'business',
  EDUCATION = 'education',
  ART_CULTURE = 'art_culture',
  GASTRONOMY = 'gastronomy',
  HEALTH_WELLNESS = 'health_wellness',
  FAMILY_KIDS = 'family_kids',
  RELIGIOUS_SPIRITUAL = 'religious_spiritual',
  GAMES = 'games',
  COMMUNITY_SOCIAL = 'community_social',
  FASHION_BEAUTY = 'fashion_beauty',
  OTHER = 'other',
}

export enum EventLocationType {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
  HYBRID = 'hybrid',
}

@Entity()
export class Events {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'organizer_id' })
  organizerId: string

  @Column({ type: 'text' })
  title: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'int', nullable: true })
  maxParticipants: number

  @Column({ type: 'enum', enum: EventLocationType })
  locationType: EventLocationType

  @Column({ type: 'text', nullable: true })
  locationName?: string

  @Column({ name: 'city_id', nullable: true })
  cityId?: number

  @Column({ type: 'varchar', length: 8, nullable: true })
  zipCode?: string

  @Column({ type: 'text', nullable: true })
  neighborhood?: string

  @Column({ type: 'text', nullable: true })
  street?: string

  @Column({ type: 'int', nullable: true })
  number?: number

  @Column({ type: 'text', nullable: true })
  complement?: string

  @Column({ type: 'timestamp with time zone' })
  startDate: Date

  @Column({ type: 'timestamp with time zone' })
  endDate: Date

  @Column({ type: 'enum', enum: EventCategory })
  category: EventCategory

  @Column({ type: 'text', nullable: true })
  bannerUrl?: string

  @Column({ type: 'boolean', default: false })
  isAdultOnly: boolean

  @Column({ name: 'event_changes_id', nullable: true })
  eventChangesId?: string

  // Limit date for refund when event is changed (does not include CDC regret purchase rule)
  @Column({ type: 'timestamp with time zone', nullable: true })
  changeRefundDeadline?: Date

  @Column({ type: 'enum', enum: EventStatus })
  status: EventStatus

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @ManyToOne(() => Users, (user) => user.events)
  @JoinColumn({ name: 'organizer_id' })
  organizer: Users

  @ManyToOne(() => Cities, (city) => city.events)
  @JoinColumn({ name: 'city_id' })
  city: Cities

  @OneToMany(() => EventChanges, (eventChange) => eventChange.event)
  @JoinColumn({ name: 'event_changes_id' })
  eventChanges: EventChanges[]

  @OneToMany(() => EventStaff, (eventStaff) => eventStaff.event)
  eventStaff: EventStaff[]

  @OneToMany(() => EventStaffInvitations, (eventStaffInvitation) => eventStaffInvitation.event)
  eventStaffInvitations: EventStaffInvitations[]

  @OneToMany(() => Attractions, (attraction) => attraction.event)
  attractions: Attractions[]

  @OneToMany(() => TicketTypes, (ticketType) => ticketType.event)
  ticketTypes: TicketTypes[]

  @OneToMany(() => Orders, (order) => order.event)
  orders: Orders[]

  @OneToMany(() => Favorites, (favorite) => favorite.event)
  favorites: Favorites[]

  @OneToMany(() => EventRatings, (eventRating) => eventRating.event)
  eventRatings: EventRatings[]

  @OneToMany(() => Tickets, (ticket) => ticket.event)
  tickets: Tickets[]
}
