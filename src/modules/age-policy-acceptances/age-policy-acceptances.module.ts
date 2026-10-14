import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AgePoliciesModule } from '~/modules/age-policies/age-policies.module'
import { AgePolicyAcceptancesController } from '~/modules/age-policy-acceptances/age-policy-acceptances.controller'
import { AgePolicyAcceptances } from '~/modules/age-policy-acceptances/age-policy-acceptances.entity'
import { AgePolicyAcceptancesService } from '~/modules/age-policy-acceptances/age-policy-acceptances.service'

@Module({
  imports: [TypeOrmModule.forFeature([AgePolicyAcceptances]), AgePoliciesModule],
  providers: [AgePolicyAcceptancesService],
  exports: [AgePolicyAcceptancesService],
  controllers: [AgePolicyAcceptancesController],
})
export class AgePolicyAcceptancesModule {}
