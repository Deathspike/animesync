import * as acm from '.';
import * as ncm from '@nestjs/common';
import cors from 'cors'

@ncm.Module({
  controllers: [acm.RemoteController],
  providers: [acm.CacheService, acm.ComposeService, acm.ProviderService]})
export class RemoteModule implements ncm.NestModule {
  configure(consumer: ncm.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes(acm.RemoteController);
  }
}
