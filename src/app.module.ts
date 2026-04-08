import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from '~/app.controller'
import { AppService } from '~/app.service'
import { modules } from '~/modules'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ...modules],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
