import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { CreateUserDto, UserDataDto, UserResponseDto } from '~/users/dto/users.dto'
import { Users } from '~/users/users.entity'

//@UseGuards()
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async create(body: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await this.hashPassword(body.password)
    const user = this.usersRepository.create({ ...body, passwordHash })
    const res = await this.usersRepository.save(user)
    return { data: plainToInstance(UserDataDto, res, { excludeExtraneousValues: true }) }
  }

  // used for authentication
  async findByEmail(email: string): Promise<Users | null> {
    const user = await this.usersRepository.findOne({ where: { email } })
    return user ?? null
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } })
    return { data: plainToInstance(UserDataDto, user, { excludeExtraneousValues: true }) }
  }

  // helpers
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }
}
