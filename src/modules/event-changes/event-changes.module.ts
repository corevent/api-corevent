import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { EventChangesService } from '~/modules/event-changes/event-changes.service'

@Module({
  imports: [TypeOrmModule.forFeature([EventChanges])],
  providers: [EventChangesService],
  exports: [EventChangesService],
})
export class EventChangesModule {}
