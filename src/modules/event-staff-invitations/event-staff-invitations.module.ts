import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StaffInvitesController } from '~/modules/event-staff-invitations/staff-invites.controller'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { EventStaffInvitationsService } from '~/modules/event-staff-invitations/event-staff.invitations.service'
import { UserInvitationsController } from '~/modules/event-staff-invitations/users-invitations.controller'
import { EventsModule } from '~/modules/events-module/events.module'
import { EventStaffModule } from '~/modules/event-staff/event-staff.module'
import { MailModule } from '~/modules/mail/mail.module'
import { UsersModule } from '~/modules/users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([EventStaffInvitations]), EventsModule, EventStaffModule, UsersModule, MailModule],
  providers: [EventStaffInvitationsService],
  exports: [EventStaffInvitationsService],
  controllers: [StaffInvitesController, UserInvitationsController],
})
export class EventStaffInvitationsModule {}
