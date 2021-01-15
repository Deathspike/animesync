import * as app from '.';
import * as api from '@nestjs/common';
import cors from 'cors'

@api.Module({
  controllers: [app.RemoteController],
  providers: [app.CacheService, app.ContextService]})
export class RemoteModule implements api.NestModule {
  configure(consumer: api.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes(app.RemoteController);
  }
}
