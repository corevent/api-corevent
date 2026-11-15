import { Repository } from 'typeorm'
import { AgePoliciesService } from '~/modules/age-policies/age-policies.service'
import { AgePolicyAcceptances } from './age-policy-acceptances.entity'
import { AgePolicyAcceptancesService } from './age-policy-acceptances.service'

describe('Age policy revocation', () => {
  const policy = { id: 'current', description: 'Terms', version: 1, isActive: true }
  let accepted: Set<string>
  let service: AgePolicyAcceptancesService
  let policies: { getActivePolicy: jest.Mock }

  beforeEach(() => {
    accepted = new Set(['alice:current', 'bob:current', 'alice:previous'])
    const repository = {
      delete: jest.fn(({ userId, agePolicyId }) => {
        accepted.delete(`${userId}:${agePolicyId}`)
        return Promise.resolve({ affected: 1 })
      }),
      findOne: jest.fn(({ where }) =>
        Promise.resolve(accepted.has(`${where.userId}:${where.agePolicyId}`) ? where : null),
      ),
      create: jest.fn((value) => value),
      save: jest.fn((value) => {
        accepted.add(`${value.userId}:${value.agePolicyId}`)
        return Promise.resolve(value)
      }),
    }
    policies = { getActivePolicy: jest.fn().mockResolvedValue({ data: policy }) }
    service = new AgePolicyAcceptancesService(
      repository as unknown as Repository<AgePolicyAcceptances>,
      policies as unknown as AgePoliciesService,
    )
  })

  it('revokes only the authenticated user acceptance for the current policy', async () => {
    await service.revokeAgePolicy('alice')
    expect(accepted).toEqual(new Set(['bob:current', 'alice:previous']))
    expect((await service.checkIfUserHasAccepted('alice')).data.userHasAccepted).toBe(false)
  })

  it('allows revocation to be retried and the current policy accepted again', async () => {
    await service.revokeAgePolicy('alice')
    await service.revokeAgePolicy('alice')
    await service.acceptAgePolicy('alice')
    expect((await service.checkIfUserHasAccepted('alice')).data.userHasAccepted).toBe(true)
  })

  it('preserves acceptances if the active policy cannot be loaded', async () => {
    policies.getActivePolicy.mockRejectedValue(new Error('No active policy'))
    await expect(service.revokeAgePolicy('alice')).rejects.toThrow('No active policy')
    expect(accepted.has('alice:current')).toBe(true)
  })
})
