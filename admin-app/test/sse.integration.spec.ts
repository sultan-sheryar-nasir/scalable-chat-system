import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('SSE Real-time Updates (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should receive real-time updates', async (done) => {
    const sseClient = request(app.getHttpServer()).get('/posts/updates');

    sseClient
      .set('Accept', 'text/event-stream')
      .buffer(false)
      .parse((res, callback) => {
        res.on('data', (chunk) => {
          const data = chunk.toString();
          if (data.startsWith('data: ')) {
            callback(null, data.replace('data: ', '').trim());
          }
        });
      })
      .then((res) => {
        expect(res.text).toContain('keepAlive');
        done();
      });

    // Simulate an update
    await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'New Post', content: 'Content for SSE' })
      .expect(201);
  });
});
