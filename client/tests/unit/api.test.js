import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../../src/utils/api';

describe('API Utility Functions', () => {
  const mockSuccessData = { data: 'test data' };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSuccessData),
        });
      })
    );

    vi.mock('../../src/utils/api', async (importOriginal) => {
      const mod = await importOriginal();
      return mod;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send GET requests correctly', async () => {
    const result = await api.get('/test-endpoint');

    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-endpoint'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );

    expect(result).toEqual(mockSuccessData);
  });

  it('should send POST requests with correct body', async () => {
    const testData = { name: 'Test Name' };
    await api.post('/test-endpoint', testData);

    expect(window.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(testData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should send PUT requests with correct body', async () => {
    const testData = { name: 'Updated Name' };
    await api.put('/test-endpoint/1', testData);

    expect(window.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(testData),
      })
    );
  });

  it('should send PATCH requests with correct body', async () => {
    const testData = { status: 'active' };
    await api.patch('/test-endpoint/1', testData);

    expect(window.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(testData),
      })
    );
  });

  it('should send DELETE requests correctly', async () => {
    await api.delete('/test-endpoint/1');

    expect(window.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('should throw an error when the response is not ok', async () => {
    const errorMessage = { message: 'Request failed' };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve(errorMessage),
        });
      })
    );

    await expect(api.get('/test-endpoint')).rejects.toEqual(errorMessage);
  });
});
