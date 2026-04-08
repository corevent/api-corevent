import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  ping(): string {
    return 'pong'
  }

  async health(): Promise<string> {
    try {
      const result: { ping: number }[] = await this.dataSource.query<{ ping: number }[]>('SELECT 1 AS ping')
      return result[0]?.ping === 1 ? 'OK' : 'KO'
    } catch (error) {
      throw new InternalServerErrorException('Error checking database health', {
        cause: error,
      })
    }
  }
}
