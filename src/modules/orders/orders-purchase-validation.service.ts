import { BadRequestException, Injectable } from '@nestjs/common'
import { isAtLeastAge } from '~/common/utils/is-at-least-age.util'
import { EventStatus } from '~/modules/events-module/events.entity'
import { EventsService } from '~/modules/events-module/events.service'
import { CreateOrderDto } from '~/modules/orders/dto/orders.dto'
import { Item } from '~/modules/pagbank/interface/pagbank.interface'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'
import { TicketsService } from '~/modules/tickets/tickets.service'
import { UsersService } from '~/modules/users/users.service'

const PURCHASABLE_EVENT_STATUSES = new Set<EventStatus>([EventStatus.OPENED, EventStatus.GOING])

@Injectable()
export class OrdersPurchaseValidationService {
  constructor(
    private readonly ticketTypesService: TicketTypesService,
    private readonly ticketsService: TicketsService,
    private readonly eventsService: EventsService,
    private readonly usersService: UsersService,
  ) {}

  assertNoDuplicateTicketTypes(items: CreateOrderDto['items']): void {
    const ticketTypeIds = items.map((item) => item.ticketTypeId)
    if (new Set(ticketTypeIds).size !== ticketTypeIds.length) {
      throw new BadRequestException('Duplicate ticket types in the same order are not allowed')
    }
  }

  async validatePurchaseEligibility(
    userId: string,
    eventId: string,
    items: CreateOrderDto['items'],
  ): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)

    if (!PURCHASABLE_EVENT_STATUSES.has(event.status)) {
      throw new BadRequestException('Event is not available for purchase')
    }

    if (event.isAdultOnly) {
      const { data: user } = await this.usersService.getById(userId)
      if (!isAtLeastAge(user.birthDate, 18)) {
        throw new BadRequestException('User must be at least 18 years old to purchase tickets for this event')
      }
    }

    const now = new Date()
    for (const item of items) {
      const { data: ticketType } = await this.ticketTypesService.getById(item.ticketTypeId)

      if (ticketType.eventId !== eventId) {
        throw new BadRequestException(`Ticket type "${ticketType.name}" does not belong to this event`)
      }

      if (now < new Date(ticketType.startDate) || now > new Date(ticketType.endDate)) {
        throw new BadRequestException(`Ticket type "${ticketType.name}" is outside its sale window`)
      }
    }
  }

  async validateFreeTicketRules(userId: string, items: CreateOrderDto['items']): Promise<void> {
    let hasFreeTicket = false
    let hasPaidTicket = false

    for (const item of items) {
      const { data: ticketType } = await this.ticketTypesService.getById(item.ticketTypeId)
      const isFree = Number(ticketType.price) === 0

      if (!isFree) {
        hasPaidTicket = true
        continue
      }

      hasFreeTicket = true

      if (item.quantity !== 1) {
        throw new BadRequestException(`Free ticket "${ticketType.name}" is limited to 1 per user`)
      }

      const hasExistingTicket = await this.ticketsService.hasUserTicketForTicketType(userId, item.ticketTypeId)
      if (hasExistingTicket) {
        throw new BadRequestException(`You already have a ticket for "${ticketType.name}"`)
      }
    }

    if (hasFreeTicket && hasPaidTicket) {
      throw new BadRequestException('Cannot mix free and paid tickets in the same order')
    }
  }

  async validateTicketAvailability(items: CreateOrderDto['items']): Promise<void> {
    const quantityByTicketType = items.reduce<Map<string, number>>((acc, item) => {
      acc.set(item.ticketTypeId, (acc.get(item.ticketTypeId) ?? 0) + item.quantity)
      return acc
    }, new Map())

    for (const [ticketTypeId, quantity] of quantityByTicketType) {
      const { data: ticketType } = await this.ticketTypesService.getById(ticketTypeId)
      if (ticketType.availableQuantity < quantity) {
        throw new BadRequestException(`Not enough tickets available for ${ticketType.name}`)
      }
    }
  }

  async buildOrderItems(
    body: CreateOrderDto,
  ): Promise<{ items: Item[]; totalAmount: number; areAllItemsFree: boolean }> {
    const items: Item[] = []
    let totalAmount = 0
    let areAllItemsFree = true

    for (const { ticketTypeId, quantity } of body.items) {
      const { data: ticketType } = await this.ticketTypesService.getById(ticketTypeId)
      const unitPrice = Number(ticketType.price)

      if (unitPrice < 0) {
        throw new BadRequestException(`Ticket type "${ticketType.name}" has an invalid price`)
      }

      if (unitPrice > 0) {
        areAllItemsFree = false
      }

      items.push({
        reference_id: ticketTypeId,
        name: ticketType.name,
        quantity,
        unit_amount: unitPrice * 100,
      })
      totalAmount += unitPrice * quantity
    }

    return { items, totalAmount, areAllItemsFree }
  }
}
