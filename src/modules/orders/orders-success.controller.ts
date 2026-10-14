import { Controller, Get, Redirect } from '@nestjs/common'
import { ApiFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Orders')
@Controller('orders')
export class OrdersSuccessController {
  @Get('success')
  @Redirect('corevent://orders', 302)
  @ApiOperation({ summary: 'Redirect the buyer back to the app after checkout' })
  @ApiFoundResponse({ description: 'Redirects to corevent://orders.' })
  redirectToApp(): void {}
}
