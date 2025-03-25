const API_URL = import.meta.env.VITE_API_URL;

/**
 * Base fetch function with default configs
 *
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise}
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const fetchOptions = {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

/**
 * GET request
 *
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise}
 */
export const get = (endpoint, options = {}) => {
  return apiFetch(endpoint, { method: 'GET', ...options });
};

/**
 * POST request with JSON body
 *
 * @param {string} endpoint
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise}
 */
export const post = (endpoint, data, options = {}) => {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PUT request with JSON body
 *
 * @param {string} endpoint
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise}
 */
export const put = (endpoint, data, options = {}) => {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PATCH request with JSON body
 *
 * @param {string} endpoint
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise}
 */
export const patch = (endpoint, data, options = {}) => {
  return apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * DELETE request
 *
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise}
 */
export const del = (endpoint, options = {}) => {
  return apiFetch(endpoint, { method: 'DELETE', ...options });
};

export default {
  get,
  post,
  put,
  patch,
  delete: del,
};
