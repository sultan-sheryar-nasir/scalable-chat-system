import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpAdapter().getInstance();
  server.get('/direct-test', (req, res) => {
    console.log('Direct route hit');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: Hello from Express!\n\n');

    const interval = setInterval(() => {
      console.log('Sending keep-alive from Express');
      res.write(`data: Keep-alive at ${new Date().toISOString()}\n\n`);
    }, 5000);

    req.on('close', () => {
      console.log('Client disconnected from /direct-test');
      clearInterval(interval);
    });
  });

  await app.listen(3000);
}
bootstrap();
