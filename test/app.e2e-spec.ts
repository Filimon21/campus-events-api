import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

describe('Campus Events Authentication API (e2e)', () => {
  let app: INestApplication;

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';

  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    expect(response.body.email).toBe(testEmail);
    expect(response.body.roles).toEqual(['user']);
    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.refreshHash).toBeUndefined();
  });

  it('2. should reject duplicate email registration', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(409);
  });

  it('3. should reject invalid registration data', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: '123',
      })
      .expect(400);
  });

  it('4. should prevent users from assigning privileged roles', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'admin-attempt@example.com',
        password: testPassword,
        roles: ['admin'],
      })
      .expect(400);
  });

  it('5. should login and return access and refresh tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('6. should reject login with an incorrect password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123!',
      })
      .expect(401);
  });

  it('7. should reject access to protected events without a token', async () => {
    await request(app.getHttpServer())
      .get('/api/events')
      .expect(401);
  });

  it('8. should allow access to events with a valid access token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it('9. should rotate refresh tokens and reject reuse of the old token', async () => {
    const oldRefreshToken = refreshToken;

    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({
        refreshToken: oldRefreshToken,
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.refreshToken).not.toBe(oldRefreshToken);

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({
        refreshToken: oldRefreshToken,
      })
      .expect(401);
  });

  it('10. should logout and reject refresh token reuse', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({
        refreshToken,
      })
      .expect(401);
  });
});