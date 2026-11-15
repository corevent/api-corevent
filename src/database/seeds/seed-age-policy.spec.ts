import { DataSource, EntityManager } from 'typeorm'
import { INITIAL_AGE_POLICY, seedAgePolicy } from './seed-age-policy'

describe('Initial age policy seed', () => {
  let policies: (typeof INITIAL_AGE_POLICY)[]
  let insert: jest.Mock
  let source: DataSource

  beforeEach(() => {
    policies = []
    insert = jest.fn((policy) => {
      policies.push({ ...policy })
      return Promise.resolve()
    })
    const manager = {
      query: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn(() => ({ count: async () => policies.length, insert })),
    } as unknown as EntityManager
    source = {
      transaction: async (work: (manager: EntityManager) => Promise<void>) => work(manager),
    } as unknown as DataSource
  })

  it('creates an active version 1 policy in an empty database', async () => {
    await seedAgePolicy(source)
    expect(policies).toEqual([INITIAL_AGE_POLICY])
  })

  it('does not duplicate or replace the policy on repeated runs', async () => {
    await seedAgePolicy(source)
    await seedAgePolicy(source)
    expect(insert).toHaveBeenCalledTimes(1)
    expect(policies).toHaveLength(1)
  })

  it('preserves the text and version of an existing active policy', async () => {
    const existing = { description: 'Existing policy', version: 3, isActive: true }
    policies.push(existing)
    await seedAgePolicy(source)
    expect(insert).not.toHaveBeenCalled()
    expect(policies).toEqual([existing])
  })

  it('does not reactivate a deliberately inactive policy', async () => {
    const inactive = { description: 'Inactive policy', version: 1, isActive: false }
    policies.push(inactive)
    await seedAgePolicy(source)
    expect(insert).not.toHaveBeenCalled()
    expect(policies).toEqual([inactive])
  })
})
