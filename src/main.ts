import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logTokenMiddleware } from './common/middleware/log-token.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(logTokenMiddleware); 
  await app.listen(3000);
}
bootstrap();
