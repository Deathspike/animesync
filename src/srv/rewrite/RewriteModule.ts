import * as app from '.';
import * as ncm from '@nestjs/common';
import cors from 'cors'

@ncm.Module({
  controllers: [app.RewriteController],
  providers: [app.HlsService]})
export class RewriteModule implements ncm.NestModule {
  configure(consumer: ncm.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes('api/rewrite');
  }
}
