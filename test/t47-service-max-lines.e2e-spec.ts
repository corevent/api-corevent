import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const MAX_SERVICE_LINES = 200

const services = [
  'src/modules/orders/orders.service.ts',
  'src/modules/tickets/tickets.service.ts',
  'src/modules/events-module/events.service.ts',
]

describe('T47 - Limite de linhas por service', () => {
  it.each(services)('%s has at most 200 lines', (relativePath) => {
    const contents = readFileSync(join(__dirname, '..', relativePath), 'utf8')
    const lineCount = contents.split('\n').length

    expect(lineCount).toBeLessThanOrEqual(MAX_SERVICE_LINES)
  })
})
