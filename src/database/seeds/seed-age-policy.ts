import { DataSource } from 'typeorm'
import { AgePolicies } from '~/modules/age-policies/age-policies.entity'

export const INITIAL_AGE_POLICY = {
  description:
    'Declaro que tenho 18 anos ou mais e estou ciente de que os eventos identificados como +18 são destinados exclusivamente a maiores de idade.',
  version: 1,
  isActive: true,
}

export async function seedAgePolicy(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (manager) => {
    // Serialize initial seeding, including concurrent executions against an empty table.
    await manager.query('LOCK TABLE "age_policies" IN SHARE ROW EXCLUSIVE MODE')
    const repository = manager.getRepository(AgePolicies)
    if (await repository.count()) {
      console.log('Age policies already exist; preserving policies and acceptances.')
      return
    }

    await repository.insert(INITIAL_AGE_POLICY)
    console.log('Initial age policy created (version 1).')
  })
}
