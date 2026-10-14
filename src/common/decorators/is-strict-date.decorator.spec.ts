import { BadRequestException, ValidationPipe, type ArgumentMetadata } from '@nestjs/common'
import { OmitType, PartialType } from '@nestjs/swagger'
import { plainToInstance } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { IsStrictDate } from '~/common/decorators/is-strict-date.decorator'

class ScheduleDto {
  @IsStrictDate()
  startDate!: Date

  @IsStrictDate()
  @IsOptional()
  endDate?: Date
}

class ScheduleResponseDto extends OmitType(ScheduleDto, ['endDate']) {
  id!: string
}

class UpdateScheduleDto extends PartialType(ScheduleDto) {}

const pipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
})

const acceptedDates: Array<[string, string]> = [
  ['2026-01-01T00:00:00Z', '2026-01-01T00:00:00.000Z'],
  ['2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
  ['2026-01-01T00:00:00-03:00', '2026-01-01T03:00:00.000Z'],
]

const rejectedDates = [
  '2026-01-01',
  '2026-01-01T00:00:00',
  '2026-01-01 00:00:00Z',
  '01/01/2026',
  '2026-02-29T00:00:00.000Z',
]

function metadataFor(metatype: ArgumentMetadata['metatype']): ArgumentMetadata {
  return { type: 'body', metatype }
}

function readMessages(error: unknown): string[] {
  if (!(error instanceof BadRequestException)) {
    throw error
  }
  const body: unknown = error.getResponse()
  if (typeof body === 'string') {
    return [body]
  }
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return []
  }
  const message: unknown = body.message
  if (typeof message === 'string') {
    return [message]
  }
  if (!Array.isArray(message)) {
    return []
  }
  return message.filter((item: unknown): item is string => typeof item === 'string')
}

async function transformSchedule(value: object): Promise<ScheduleDto> {
  const transformed: unknown = await pipe.transform(value, metadataFor(ScheduleDto))
  return transformed as ScheduleDto
}

async function messagesFor(startDate: string): Promise<string[]> {
  try {
    await transformSchedule({ startDate })
  } catch (error: unknown) {
    return readMessages(error)
  }
  throw new Error(`Expected ${startDate} to be rejected`)
}

describe('IsStrictDate', () => {
  it.each(acceptedDates)('accepts %s and returns a Date', async (input, expected) => {
    const result = await transformSchedule({ startDate: input })

    expect(result.startDate).toBeInstanceOf(Date)
    expect(result.startDate.toISOString()).toBe(expected)
    expect(result.endDate).toBeUndefined()
  })

  it.each(rejectedDates)('rejects %s with a single ISO 8601 message', async (input) => {
    const messages = await messagesFor(input)

    expect(messages).toEqual(['startDate must be a valid ISO 8601 date string'])
  })

  it('keeps an inherited response date as a Date instance', () => {
    const response = plainToInstance(ScheduleResponseDto, {
      id: '1',
      startDate: new Date('2026-06-01T12:00:00.000Z'),
    })

    expect(response.startDate).toBeInstanceOf(Date)
    expect(JSON.parse(JSON.stringify(response))).toEqual({
      id: '1',
      startDate: '2026-06-01T12:00:00.000Z',
    })
  })

  it('accepts a partial update date', async () => {
    const transformed: unknown = await pipe.transform(
      { endDate: '2026-07-01T00:00:00Z' },
      metadataFor(UpdateScheduleDto),
    )
    const result = transformed as UpdateScheduleDto

    expect(result.startDate).toBeUndefined()
    expect(result.endDate).toBeInstanceOf(Date)
    expect(result.endDate?.toISOString()).toBe('2026-07-01T00:00:00.000Z')
  })
})
