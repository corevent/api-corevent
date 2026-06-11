import { Controller, Get, Redirect } from '@nestjs/common'

@Controller('orders')
export class OrdersSuccessController {
  @Get('success')
  @Redirect('corevent://orders', 302)
  redirectToApp(): void {}
}
