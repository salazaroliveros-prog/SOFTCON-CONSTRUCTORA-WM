// Compat entrypoint for imports like: import api from './api'
// The configured Axios instance (headers + interceptors) lives in ./api/client.js
import api from './api/client.js';

export default api;