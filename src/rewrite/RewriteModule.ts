import * as acm from '.';
import * as ncm from '@nestjs/common';
import cors from 'cors'

@ncm.Module({
  controllers: [acm.RewriteController],
  providers: [acm.HlsService]})
export class RewriteModule implements ncm.NestModule {
  configure(consumer: ncm.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes(acm.RewriteController);
  }
}
