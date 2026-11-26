import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import {
  EventDataDto,
  EventResponseDto,
  ListEventsDto,
  PaginateEventsDto,
  QueryEventsDto,
} from '~/modules/events-module/dto/events.dto'
import { EventRatings } from '~/modules/event-ratings/event-ratings.entity'
import { Events, EventStatus } from '~/modules/events-module/events.entity'

type EventListRawRow = {
  averageRating?: string | number | null
  eventStaffAccessLevel?: string | null
  favoriteId?: string | null
}

@Injectable()
export class EventsQueryService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    @Inject(forwardRef(() => EventStaffService))
    private readonly eventStaffService: EventStaffService,
  ) {}

  async getAll(
    queryParams: QueryEventsDto,
    userId?: string,
    type?: 'organizer' | 'staff' | 'favorite',
  ): Promise<PaginateEventsDto> {
    const { page, limit, status } = queryParams
    const query = this.buildBaseQuery()
      .limit(limit)
      .offset(getOffset(page, limit))
      .where('e.status = :status', { status })
    this.applyFilters(query, queryParams)
    this.applySearch(query, queryParams.search)
    this.applyTypeOfList(query, userId, type)

    const total = await query.getCount()
    const { entities, raw } = await query.getRawAndEntities()
    const rawRows = raw as EventListRawRow[]
    const list = entities.map((entity, index) => ({
      ...entity,
      averageRating: this.parseAverageRating(rawRows[index]?.averageRating),
      accessLevel: rawRows[index]?.eventStaffAccessLevel ?? undefined,
      favoriteId: rawRows[index]?.favoriteId ?? undefined,
    }))

    return {
      data: plainToInstance(ListEventsDto, list),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async getById(id: string, viewerId?: string): Promise<EventResponseDto> {
    const { entities, raw } = await this.buildBaseQuery().where('e.id = :id', { id }).getRawAndEntities()
    const event = entities[0]
    if (!event) throw new NotFoundException('Event not found')

    const rawRow = raw[0] as { averageRating?: string | number | null } | undefined
    const data = plainToInstance(EventDataDto, {
      ...event,
      averageRating: this.parseAverageRating(rawRow?.averageRating),
    })

    if (data.status === EventStatus.DRAFT && viewerId !== undefined) {
      await this.assertDraftViewerAccess(viewerId, data)
    }

    return { data }
  }

  private async assertDraftViewerAccess(viewerId: string, event: EventDataDto): Promise<void> {
    if (event.organizer.id === viewerId) {
      return
    }

    try {
      await this.eventStaffService.validateOrganizerOrStaff(viewerId, event.id)
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new NotFoundException('Event not found')
      }
      throw error
    }
  }

  private applySearch(query: SelectQueryBuilder<Events>, search?: string): void {
    if (search) {
      query.andWhere('unaccent(e.title) ILIKE unaccent(:search)', { search: `%${search}%` })
    }
  }

  private applyFilters(
    query: SelectQueryBuilder<Events>,
    filters: Pick<QueryEventsDto, 'stateId' | 'cityId' | 'startDate' | 'category' | 'isAdultOnly'>,
  ): void {
    if (filters.stateId !== undefined) {
      query.andWhere('s.id = :stateId', { stateId: filters.stateId })
    }
    if (filters.cityId !== undefined) {
      query.andWhere('e.cityId = :cityId', { cityId: filters.cityId })
    }
    if (filters.startDate) {
      query.andWhere('e.startDate >= :startDate', { startDate: filters.startDate })
    }
    if (filters.category) {
      query.andWhere('e.category = :category', { category: filters.category })
    }
    if (filters.isAdultOnly !== undefined) {
      query.andWhere('e.isAdultOnly = :isAdultOnly', { isAdultOnly: filters.isAdultOnly })
    }
  }

  private buildBaseQuery(): SelectQueryBuilder<Events> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .select([
        'e.id',
        'e.title',
        'e.maxParticipants',
        'c.id',
        'c.name',
        's.id',
        's.name',
        's.acronym',
        'e.locationName',
        'e.locationType',
        'e.startDate',
        'e.endDate',
        'e.category',
        'e.bannerKey',
        'e.isAdultOnly',
        'e.status',
        'o.id',
        'o.name',
        'o.email',
        'o.avatarKey',
      ])
      .innerJoin('e.organizer', 'o')
      .leftJoin('e.city', 'c')
      .leftJoin('c.state', 's')
      .addSelect((subQuery) => {
        return subQuery
          .select('AVG(eventRating.rating)', 'averageRating')
          .from(EventRatings, 'eventRating')
          .where('eventRating.eventId = e.id')
      }, 'averageRating')
  }

  private applyTypeOfList(
    query: SelectQueryBuilder<Events>,
    userId?: string,
    type?: 'organizer' | 'staff' | 'favorite',
  ): void {
    if (userId && !type) {
      throw new BadRequestException('Type is required when userId is provided')
    }
    if (!userId && type) {
      throw new BadRequestException('UserId is required when type is provided')
    }

    if (type === 'organizer') {
      query.andWhere('e.organizerId = :userId', { userId })
    }
    if (type === 'staff') {
      query
        .innerJoin('e.eventStaff', 'es')
        .andWhere('es.userId = :userId', { userId })
        .addSelect('es.access_level', 'eventStaffAccessLevel')
    }
    if (type === 'favorite') {
      query.innerJoin('e.favorites', 'f').andWhere('f.userId = :userId', { userId }).addSelect('f.id', 'favoriteId')
    }
  }

  private parseAverageRating(value: unknown): number | null {
    if (value == null) return null
    return Number(value)
  }
}
