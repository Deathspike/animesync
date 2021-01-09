import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';
import {NestFactory} from '@nestjs/core';
import {ServerModule} from './ServerModule';

export async function serverAsync() {
  const app = await NestFactory.create(ServerModule);
  attachRequestValidation(app);
  attachSwagger(app);
  await app.listen(3000);
  return app;
}

function attachRequestValidation(app: api.INestApplication) {
  app.useGlobalPipes(new api.ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true
  }));
}

function attachSwagger(app: api.INestApplication) {
  swg.SwaggerModule.setup('swagger', app, swg.SwaggerModule.createDocument(app, new swg.DocumentBuilder()
    .setDescription(require('../../package').description)
    .setTitle(require('../../package').name)
    .setVersion(require('../../package').version)
    .build()));
}
