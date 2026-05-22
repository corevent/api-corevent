import { DataSource } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { Users } from '~/modules/users/users.entity'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { PixType } from '~/modules/organizer-payment-info/dto/organizer-payment-info.dto'

export async function seedUser(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(Users)

  console.log('Initializing user seed...')

  // UPSERT user
  await userRepo
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

  const user = await userRepo.findOne({ where: { email: 'user@email.com' } })
  if (!user) {
    throw new Error('User not found')
  }

  const organizerRepo = dataSource.getRepository(OrganizerPaymentInfo)

  await organizerRepo
    .createQueryBuilder()
    .insert()
    .values({
      userId: user.id,
      description: 'Main bank account',
      bankCode: '260',
      accountNumber: '1234567890',
      accountDigit: '0',
      pixKey: '1234567890',
      pixType: PixType.CPF,
      branchNumber: '1234',
      branchDigit: '5',
    })
    .orIgnore() // avoid duplicates
    .execute()

  console.log('User seed finished!')
}
