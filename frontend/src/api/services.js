import api from './config.js';

export const proyectosApi = {
  // NOTE: backend currently has POST /proyectos (query params) but not GET /proyectos
  getAll: () => api.get('/proyectos'),
  getById: (id) => api.get(`/proyectos/${id}`),
  crear: (data) => {
    const nombre = data?.nombre ?? data?.nombre_proyecto ?? data?.nombreProyecto;
    const depto = data?.depto ?? data?.departamento;

    // Backend: crear_proyecto(nombre: str, depto: str)
    if (nombre && depto) {
      return api.post('/proyectos', null, { params: { nombre, depto } });
    }

    // Fallback: try JSON body if backend is later adjusted
    return api.post('/proyectos', data);
  },
  getFinanzas: (id) => api.get(`/finanzas/estado-resultado/${id}`),
};

export const inventarioApi = {
  // Your proposed endpoint
  getMateriales: (proyectoId) => api.get(`/proyectos/${proyectoId}/inventario`),
  crearOrdenCompra: (proyectoId, data) => api.post(`/proyectos/${proyectoId}/orden-compra`, data),
};

export const finanzasPersonalesApi = {
  // Prefer the newer shape used by the UI snippets; fallback keeps compatibility
  getResumen: () => api.get('/finanzas-personales/resumen').catch(() => api.get('/finanzas/resumen')),
  registrarGasto: (data) => api.post('/finanzas-personales/gasto', data).catch(() => api.post('/gastos-personales', data)),
};

export const authApi = {
  // Backend /auth/login expects OAuth2PasswordRequestForm (x-www-form-urlencoded)
  login: ({ username, password }) => {
    const body = new URLSearchParams();
    body.set('username', username ?? '');
    body.set('password', password ?? '');

    return api.post('/auth/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  register: (data) => api.post('/auth/register', data),
};
