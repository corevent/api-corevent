import { DataSource } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { Users } from '~/modules/users/users.entity'

export async function seedUser(dataSource: DataSource) {
  const stateRepo = dataSource.getRepository(Users)

  console.log('Initializing user seed...')

  // UPSERT user
  await stateRepo
    .createQueryBuilder()
    .insert()
    .values({
      name: 'User',
      email: 'user@email.com',
      cpf: '17666789041',
      birthDate: '2000-01-01',
      passwordHash: await bcrypt.hash('@Teste123', 10),
      avatarUrl: 'https://corevent.com/avatar.png',
    })
    .orIgnore() // avoid duplicates
    .execute()

  console.log('User seed finished!')
}
