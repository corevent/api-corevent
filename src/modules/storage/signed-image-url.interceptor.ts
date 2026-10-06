import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, from, mergeMap } from 'rxjs'
import { StorageService } from '~/modules/storage/storage.service'

@Injectable()
export class SignedImageUrlInterceptor implements NestInterceptor {
  constructor(private readonly storageService: StorageService) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(mergeMap((data: unknown) => from(this.storageService.signResponseImages(data))))
  }
}
