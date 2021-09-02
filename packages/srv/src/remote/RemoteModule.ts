import * as app from '.';
import * as ncm from '@nestjs/common';
import cors from 'cors'

@ncm.Module({
  controllers: [app.RemoteController],
  providers: [app.ComposeService, app.ProviderService]})
export class RemoteModule implements ncm.NestModule {
  configure(consumer: ncm.MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes(app.RemoteController);
  }
}
