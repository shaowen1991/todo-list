import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('Todo Lists API - Unauthenticated', () => {
  test('GET /api/todo-lists should require auth', async () => {
    const response = await request(app).get('/api/todo-lists');
    expect(response.status).toBe(401);
  });

  test('POST /api/todo-lists should require auth', async () => {
    const response = await request(app).post('/api/todo-lists').send({
      title: 'New List',
      description: 'Some description',
    });
    expect(response.status).toBe(401);
  });

  test('GET /api/todo-lists/:listId/todos should require auth', async () => {
    const response = await request(app).get('/api/todo-lists/1/todos');
    expect(response.status).toBe(401);
  });

  test('POST /api/todo-lists/:listId/todos should require auth', async () => {
    const response = await request(app).post('/api/todo-lists/1/todos').send({
      title: 'New Todo',
      description: 'Todo description',
    });
    expect(response.status).toBe(401);
  });

  test('GET /api/todo-lists/:listId/todos/:todoId should require auth', async () => {
    const response = await request(app).get('/api/todo-lists/1/todos/1');
    expect(response.status).toBe(401);
  });

  test('PUT /api/todo-lists/:listId/todos/:todoId should require auth', async () => {
    const response = await request(app).put('/api/todo-lists/1/todos/1').send({
      title: 'Updated Todo',
      status: 'IN_PROGRESS',
    });
    expect(response.status).toBe(401);
  });

  test('POST /api/todo-lists/:listId/access/requests should require auth', async () => {
    const response = await request(app)
      .post('/api/todo-lists/1/access/requests')
      .send({ permission: 'VIEW' });
    expect(response.status).toBe(401);
  });

  test('GET /api/todo-lists/:listId/access/requests should require auth', async () => {
    const response = await request(app).get(
      '/api/todo-lists/1/access/requests'
    );
    expect(response.status).toBe(401);
  });

  test('PUT /api/todo-lists/:listId/access/requests/:userId should require auth', async () => {
    const response = await request(app)
      .put('/api/todo-lists/1/access/requests/2')
      .send({ status: 'ACCEPTED' });
    expect(response.status).toBe(401);
  });
});
