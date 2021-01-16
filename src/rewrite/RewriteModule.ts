import * as apx from '.';
import * as api from '@nestjs/common';
import cors from 'cors'

@api.Module({
  controllers: [apx.RewriteController],
  providers: [apx.HlsService]})
export class RewriteModule implements api.NestModule {
  configure(consumer: api.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes(apx.RewriteController);
  }
}
