import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me')
};

export const videoAPI = {
  getAll: (params) => api.get('/api/videos', { params }),
  getById: (id) => api.get(\`/api/videos/\${id}\`),
  upload: (formData, onProgress) => api.post('/api/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total))
  }),
  update: (id, data) => api.put(\`/api/videos/\${id}\`, data),
  delete: (id) => api.delete(\`/api/videos/\${id}\`),
  transcode: (id) => api.post(\`/api/videos/\${id}/transcode\`),
  getStatus: (id) => api.get(\`/api/videos/\${id}/status\`)
};

export const streamAPI = {
  getToken: (videoId) => api.get(\`/api/stream/token/\${videoId}\`)
};

export const settingsAPI = {
  getAll: () => api.get('/api/settings'),
  update: (key, value) => api.put(\`/api/settings/\${key}\`, { value })
};

export const monitoringAPI = {
  getSystemStats: () => api.get('/api/monitoring/stats'),
  getVideoStats: () => api.get('/api/monitoring/videos'),
  getBandwidth: () => api.get('/api/monitoring/bandwidth')
};

export default api;
