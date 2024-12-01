import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('REST API Endpoints (Integration)', () => {
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

  it('should create a new post', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Test Post', content: 'This is a test post.' })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: 'Test Post',
      content: 'This is a test post.',
    });
  });

  it('should retrieve all posts', async () => {
    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should retrieve a specific post by ID', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Another Post', content: 'Content of another post.' });

    const postId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: postId,
      title: 'Another Post',
      content: 'Content of another post.',
    });
  });

  it('should update a post by ID', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Post to Update', content: 'Content to be updated.' });

    const postId = createResponse.body.id;

    const response = await request(app.getHttpServer())
      .put(`/posts/${postId}`)
      .send({ title: 'Updated Post', content: 'Updated content.' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: postId,
      title: 'Updated Post',
      content: 'Updated content.',
    });
  });

  it('should delete a post by ID', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Post to Delete', content: 'Content to delete.' });

    const postId = createResponse.body.id;

    await request(app.getHttpServer()).delete(`/posts/${postId}`).expect(200);

    await request(app.getHttpServer()).get(`/posts/${postId}`).expect(404);
  });
});
