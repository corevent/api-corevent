import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { isValidCnpj, isValidCpf } from '~/common/utils/cpf-cnpj.util'
import { getOffset } from '~/common/utils/get-offset.util'
import { hasValue } from '~/common/utils/has-value.util'
import { validateCelphone } from '~/common/utils/validate-celphone'
import { validateEmail } from '~/common/utils/validate-email.utils'
import { validateRandomKey } from '~/common/utils/validate-random-key.util'
import {
  CreateOrganizerPaymentInfoDto,
  OrganizerPaymentInfoDataDto,
  ListOrganizerPaymentInfoDto,
  OrganizerPaymentInfoPageDto,
  PixType,
  OrganizerPaymentInfoResDto,
  UpdateOrganizerPaymentInfoDto,
} from '~/modules/organizer-payment-info/dto/organizer-payment-info.dto'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { UsersService } from '~/modules/users/users.service'

@Injectable()
export class OrganizerPaymentInfoService {
  constructor(
    @InjectRepository(OrganizerPaymentInfo)
    private organizerPaymentInfoRepository: Repository<OrganizerPaymentInfo>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, body: CreateOrganizerPaymentInfoDto): Promise<OrganizerPaymentInfoResDto> {
    await this.validateBody(body, userId)
    const organizerPaymentInfo = this.organizerPaymentInfoRepository.create({ ...body, userId })
    const data = await this.organizerPaymentInfoRepository.save(organizerPaymentInfo)
    return { data: plainToInstance(OrganizerPaymentInfoDataDto, data) }
  }

  async update(userId: string, id: string, body: UpdateOrganizerPaymentInfoDto): Promise<OrganizerPaymentInfoResDto> {
    const current = await this.getById(userId, id)
    await this.validateBody({ ...current.data, ...body })
    await this.organizerPaymentInfoRepository.update(id, body)
    return this.getById(userId, id)
  }

  async listByUserId(userId: string, query: QueryPaginationDto): Promise<OrganizerPaymentInfoPageDto> {
    const { page, limit } = query
    const [data, total] = await this.organizerPaymentInfoRepository.findAndCount({
      select: ['id', 'description'],
      where: { userId },
      skip: getOffset(page, limit),
      take: limit,
      order: { createdAt: 'DESC' },
    })

    return {
      data: plainToInstance(ListOrganizerPaymentInfoDto, data),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async getById(userId: string, id: string): Promise<OrganizerPaymentInfoResDto> {
    const organizerPaymentInfo = await this.organizerPaymentInfoRepository.findOne({ where: { id } })
    if (!organizerPaymentInfo) {
      throw new NotFoundException('Organizer payment info not found')
    }
    if (organizerPaymentInfo.userId !== userId) {
      throw new ForbiddenException('You do not own this payment info')
    }
    return {
      data: plainToInstance(OrganizerPaymentInfoDataDto, organizerPaymentInfo, { excludeExtraneousValues: true }),
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    const organizerPaymentInfo = await this.organizerPaymentInfoRepository.findOne({
      where: { id },
      select: ['id', 'userId'],
    })
    if (!organizerPaymentInfo) {
      throw new NotFoundException('Organizer payment info not found')
    }
    if (organizerPaymentInfo.userId !== userId) {
      throw new ForbiddenException('You do not own this payment info')
    }
    await this.organizerPaymentInfoRepository.delete(id)
  }

  // used to check if user is a organizer
  async getByUserId(userId: string): Promise<void> {
    const organizerPaymentInfo = await this.organizerPaymentInfoRepository.findOne({ where: { userId } })
    if (!organizerPaymentInfo) {
      throw new NotFoundException('User is not a organizer')
    }
  }

  // helpers
  private validateAllOrNone(groupName: string, fields: Record<string, unknown>): boolean {
    const entries = Object.entries(fields)
    const filled = entries.filter(([, value]) => hasValue(value))
    const total = entries.length
    if (filled.length > 0 && filled.length < total) {
      const missing = entries.filter(([, value]) => !hasValue(value)).map(([field]) => field)
      throw new BadRequestException(`${groupName} incomplete. Missing fields: ${missing.join(', ')}`)
    }
    return filled.length === total
  }

  private async validateUserAge(userId: string): Promise<void> {
    const { data: user } = await this.usersService.getById(userId)
    const today = new Date()
    const birthDate = new Date(user.birthDate)

    const eighteenYearsLater = new Date(birthDate)
    eighteenYearsLater.setFullYear(birthDate.getFullYear() + 18)

    if (today < eighteenYearsLater) {
      throw new BadRequestException('User must be at least 18 years old')
    }
  }

  private async validateBody(
    body: CreateOrganizerPaymentInfoDto | UpdateOrganizerPaymentInfoDto,
    userId?: string,
  ): Promise<void> {
    if (userId) {
      await this.validateUserAge(userId)
    }

    const hasCompleteBank = this.validateAllOrNone('Bank data', {
      branchNumber: body.branchNumber,
      branchDigit: body.branchDigit,
      accountNumber: body.accountNumber,
      accountDigit: body.accountDigit,
      bankCode: body.bankCode,
    })

    const hasCompletePix = this.validateAllOrNone('PIX data', {
      pixKey: body.pixKey,
      pixType: body.pixType,
    })

    if (hasCompletePix) {
      this.validatePixKey(body.pixType!, body.pixKey!)
    }

    if (!hasCompleteBank && !hasCompletePix) {
      throw new BadRequestException('Inform a complete payment method: bank data or PIX data (or both).')
    }
  }

  private validatePixKey(pixType: PixType, pixKey: string): void {
    const validations = {
      [PixType.CPF]: isValidCpf,
      [PixType.CNPJ]: isValidCnpj,
      [PixType.EMAIL]: validateEmail,
      [PixType.PHONE]: validateCelphone,
      [PixType.RANDOM]: validateRandomKey,
    }

    const isValid = validations[pixType]?.(pixKey) ?? false
    if (!isValid) {
      throw new BadRequestException(`Invalid ${pixType} key: ${pixKey}`)
    }
  }
}
