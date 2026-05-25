import { Controller, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { AttractionsService } from '~/modules/attractions/attractions.service'

@ApiTags('Events - Attractions')
@UseGuards(AuthGuard('jwt'))
@Controller('events/:eventId/attractions')
export class AttractionsController {
  constructor(private readonly attractionsService: AttractionsService) {}
}
