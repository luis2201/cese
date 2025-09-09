// services/apiService.js
import config from '../config';

const API_URL = config.API_URL;

// === Token helpers ===
const getToken = () => localStorage.getItem('token');

// === Core request (maneja errores con status/payload) ===
const request = async (endpoint, method = 'GET', data = null, auth = false, headers = {}) => {
  const options = {
    method,
    headers: {
      ...(data ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (auth) {
    const token = getToken();
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) options.body = JSON.stringify(data);

  let res;
  try {
    res = await fetch(`${API_URL}/${endpoint}`, options);
  } catch (networkErr) {
    const err = new Error('No fue posible conectar con el servidor');
    err.status = 0;
    err.payload = null;
    throw err;
  }

  // intenta parsear payload
  const ct = res.headers.get('content-type') || '';
  let payload = null;
  try {
    payload = ct.includes('application/json') ? await res.json() : await res.text();
    if (payload === '') payload = null;
  } catch (_) {
    payload = null;
  }

  if (!res.ok) {
    // Crea un error enriquecido
    const message =
      (payload && (payload.message || payload.error || payload.detail)) ||
      `Error ${res.status}: ${res.statusText || 'Solicitud fallida'}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return null;

  return payload;
};

// === API helpers ===
export const getData    = (endpoint, auth = false)           => request(endpoint, 'GET',  null, auth);
export const postData   = (endpoint, data, auth = false)     => request(endpoint, 'POST', data, auth);
export const putData    = (endpoint, data, auth = false)     => request(endpoint, 'PUT',  data, auth);
export const deleteData = (endpoint, auth = false)           => request(endpoint, 'DELETE', null, auth);

// === Auth ===
export const login = async (credentials) => {
  try {
    const response = await postData('auth/login', credentials);
    if (response?.token && response?.nombres && response?.tipousuario) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userData', JSON.stringify({
        nombres: response.nombres,
        tipousuario: response.tipousuario,
      }));
    }
    return response;
  } catch (error) {
    // Propaga con status/payload para que el caller decida
    throw error;
  }
};

// === Usuario ===
export const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('userData')) || { nombres: 'Usuario', tipousuario: 'INVITADO' };
  } catch {
    return { nombres: 'Usuario', tipousuario: 'INVITADO' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
};

export const isAuthenticated = () => !!getToken();
