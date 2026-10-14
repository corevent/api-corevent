import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AgePoliciesController } from '~/modules/age-policies/age-policies.controller'
import { AgePolicies } from '~/modules/age-policies/age-policies.entity'
import { AgePoliciesService } from '~/modules/age-policies/age-policies.service'

@Module({
  imports: [TypeOrmModule.forFeature([AgePolicies])],
  providers: [AgePoliciesService],
  exports: [AgePoliciesService],
  controllers: [AgePoliciesController],
})
export class AgePoliciesModule {}
