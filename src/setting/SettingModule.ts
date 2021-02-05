import * as app from '.';
import * as ncm from '@nestjs/common';
import bodyParser from 'body-parser';
import cors from 'cors'

@ncm.Module({
  controllers: [app.SettingController],
  providers: [app.SettingService]})
export class SettingModule implements ncm.NestModule {
  configure(consumer: ncm.MiddlewareConsumer) {
    consumer.apply(bodyParser.json()).forRoutes(app.SettingController);
    consumer.apply(cors()).forRoutes(app.SettingController);
  }
}
