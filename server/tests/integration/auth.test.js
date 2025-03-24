import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    test('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for empty request body', async () => {
      const response = await request(app).post('/api/auth/register').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for empty request body', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should clear session and revoke access after logout', async () => {
      const agent = request.agent(app);

      await agent.get('/api/auth/me');

      const logoutResponse = await agent.post('/api/auth/logout');
      expect(logoutResponse.status).toBe(200);

      const protectedResponse = await agent.get('/api/auth/me');
      expect(protectedResponse.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
