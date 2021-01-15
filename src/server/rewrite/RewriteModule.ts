import * as app from '.';
import * as api from '@nestjs/common';
import cors from 'cors'

@api.Module({
  controllers: [app.RewriteController],
  providers: [app.HlsService]})
export class RewriteModule implements api.NestModule {
  configure(consumer: api.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes(app.RewriteController);
  }
}
