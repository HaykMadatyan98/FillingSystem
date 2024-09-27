import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { GlobalExceptionFilter } from './exceptions/global-exception.filter';
import { Logger, ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;
  app.enableCors();

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Filling System API')
      .setDescription('Filling System Api Description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: false }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(PORT, () => {
    Logger.log(`Port: ${PORT}`);
  });
}
bootstrap();
