import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:4000', // replace with your frontend URL
    credentials: true, // if you need to send cookies
  });

  await app.listen(3000);
}
bootstrap();
