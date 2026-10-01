import request from 'supertest'
import { EventLocationType, EventStatus } from '~/modules/events-module/events.entity'
import { setupE2EApp } from './helpers/setup-e2e-app'

interface OpenApiSchema {
  type?: string
  format?: string
  enum?: string[]
  nullable?: boolean
  minimum?: number
  minLength?: number
  maxLength?: number
  required?: string[]
  properties?: Record<string, OpenApiSchema>
}

interface OpenApiParameter {
  name: string
  in: string
  required?: boolean
  schema?: OpenApiSchema
}

interface OpenApiSpec {
  components: { schemas: Record<string, OpenApiSchema> }
  paths: Record<string, Record<string, { parameters?: OpenApiParameter[]; responses: Record<string, unknown> }>>
}

describe('T35 - Documentação da API acessível', () => {
  const ctx = setupE2EApp()

  it('serves swagger UI and openapi json with main paths', async () => {
    const swagger = await request(ctx.app.getHttpServer()).get('/swagger')
    const spec = await request(ctx.app.getHttpServer()).get('/swagger-json')

    expect(swagger.status).toBe(200)
    expect(swagger.text.toLowerCase()).toMatch(/swagger|openapi|api corevent/)
    expect(spec.status).toBe(200)
    expect(JSON.stringify(spec.body).toLowerCase()).toMatch(/\/auth\/register/)
    expect(JSON.stringify(spec.body).toLowerCase()).toMatch(/\/events/)
  })

  it('documents dto types, enums, optional fields and limits', async () => {
    const spec = await request(ctx.app.getHttpServer()).get('/swagger-json')
    expect(spec.status).toBe(200)

    const body = spec.body as OpenApiSpec
    const createEvent = body.components.schemas.CreateEventDto
    expect(createEvent.properties?.title.type).toBe('string')
    expect(createEvent.properties?.locationType.enum).toEqual(expect.arrayContaining(Object.values(EventLocationType)))
    expect(createEvent.properties?.status.enum).toEqual([EventStatus.DRAFT, EventStatus.OPENED])
    expect(createEvent.properties?.startDate.format).toBe('date-time')
    expect(createEvent.properties?.zipCode.minLength).toBe(8)
    expect(createEvent.properties?.zipCode.maxLength).toBe(8)
    expect(createEvent.properties?.cityId.minimum).toBe(1)
    expect(createEvent.required).toEqual(expect.arrayContaining(['title', 'locationType', 'status']))
    expect(createEvent.required).not.toContain('description')

    const checkinOrder = body.components.schemas.CheckinOrderDto
    expect(checkinOrder.properties?.status.enum).toEqual(expect.arrayContaining(['pending', 'paid', 'cancelled']))
    expect(checkinOrder.properties?.gatewayTransactionId.nullable).toBe(true)
    expect(checkinOrder.required ?? []).not.toContain('gatewayTransactionId')

    const listQuery = body.paths['/api/events'].get.parameters ?? []
    const status = listQuery.find((parameter) => parameter.in === 'query' && parameter.name === 'status')
    const search = listQuery.find((parameter) => parameter.in === 'query' && parameter.name === 'search')
    expect(status?.schema?.enum).toEqual([EventStatus.OPENED, EventStatus.GOING, EventStatus.FINISHED])
    expect(status?.required).toBe(true)
    expect(search?.required).toBe(false)
  })
})
