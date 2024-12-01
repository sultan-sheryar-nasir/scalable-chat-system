import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for WebSocket and REST API.
  await app.listen(3001);
  console.log('User app is running on http://localhost:3001');
}
bootstrap();
