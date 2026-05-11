import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcryptjs'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { isValidCpf } from '~/common/utils/cpf-cnpj.util'
import { CreateUserDto, UserDataDto, UserResponseDto } from '~/modules/users/dto/users.dto'
import { Users } from '~/modules/users/users.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async create(body: CreateUserDto): Promise<UserResponseDto> {
    await this.validateCpfAndEmail(body.cpf, body.email)
    const passwordHash = await this.validateAndhashPassword(body.password)
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
  private async validateAndhashPassword(password: string): Promise<string> {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long')
    }
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter')
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter')
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number')
    }
    if (!/[!@#$%^&*]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character')
    }

    return await bcrypt.hash(password, 10)
  }

  private async validateCpfAndEmail(cpf: string, email: string): Promise<void> {
    if (!isValidCpf(cpf)) {
      throw new BadRequestException('Invalid CPF')
    }

    const emailAlreadyUsed = await this.findByEmail(email)
    if (emailAlreadyUsed) {
      throw new BadRequestException('Email already used by another user')
    }
  }
}
