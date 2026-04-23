import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { Pagination } from '~/common/pagination/pagination.interface'
import { isValidCnpj, isValidCpf } from '~/common/utils/cpf-cnpj.util'
import { hasValue } from '~/common/utils/has-value.util'
import { validateCelphone } from '~/common/utils/validate-celphone'
import { validateEmail } from '~/common/utils/validate-email.utils'
import { validateRandomKey } from '~/common/utils/validate-random-key.util'
import {
  CreateOrganizerPaymentInfoDto,
  DataOrganizerPaymentInfoDto,
  ListOrganizerPaymentInfoDto,
  OrganizerPaymentInfoPageDto,
  PixType,
  ResOrganizerPaymentInfoDto,
} from '~/organizer-payment-info/dto/organizer-payment-info.dto'
import { OrganizerPaymentInfo } from '~/organizer-payment-info/organizer-payment-info.entity'

@Injectable()
export class OrganizerPaymentInfoService {
  constructor(
    @InjectRepository(OrganizerPaymentInfo)
    private organizerPaymentInfoRepository: Repository<OrganizerPaymentInfo>,
  ) {}

  async create(userId: string, body: CreateOrganizerPaymentInfoDto): Promise<ResOrganizerPaymentInfoDto> {
    this.validateDto(body)
    const organizerPaymentInfo = this.organizerPaymentInfoRepository.create({ ...body, userId })
    const data = await this.organizerPaymentInfoRepository.save(organizerPaymentInfo)
    return { data: plainToInstance(DataOrganizerPaymentInfoDto, data) }
  }

  async update(id: string, body: CreateOrganizerPaymentInfoDto): Promise<ResOrganizerPaymentInfoDto> {
    this.validateDto(body)
    await this.organizerPaymentInfoRepository.update(id, body)
    return this.getById(id)
  }

  async listByUserId(userId: string, pagination: Pagination): Promise<OrganizerPaymentInfoPageDto> {
    const offset = (pagination.currentPage - 1) * pagination.itemsPerPage
    const [data, total] = await this.organizerPaymentInfoRepository.findAndCount({
      select: ['id', 'description'],
      where: { userId },
      skip: offset,
      take: pagination.itemsPerPage,
      order: { createdAt: 'DESC' },
    })

    return {
      data: plainToInstance(ListOrganizerPaymentInfoDto, data),
      meta: createPaginationMeta(pagination.currentPage, pagination.itemsPerPage, total),
    }
  }

  async getById(id: string): Promise<ResOrganizerPaymentInfoDto> {
    const organizerPaymentInfo = await this.organizerPaymentInfoRepository.findOne({ where: { id } })
    if (!organizerPaymentInfo) {
      throw new NotFoundException('Organizer payment info not found')
    }
    return {
      data: plainToInstance(DataOrganizerPaymentInfoDto, organizerPaymentInfo, { excludeExtraneousValues: true }),
    }
  }

  async delete(id: string): Promise<void> {
    const { affected } = await this.organizerPaymentInfoRepository.delete(id)
    if (affected === 0) {
      throw new NotFoundException('Organizer payment info not found')
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

  private validateDto(body: CreateOrganizerPaymentInfoDto): void {
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
