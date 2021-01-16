import * as apx from '.';
import * as api from '@nestjs/common';
import cors from 'cors'

@api.Module({
  controllers: [apx.RemoteController],
  providers: [apx.CacheService, apx.ComposeService, apx.ProviderService]})
export class RemoteModule implements api.NestModule {
  configure(consumer: api.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes(apx.RemoteController);
  }
}
