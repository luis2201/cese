// src/services/apiService.js
import config from '../config';

const API_URL = String(config.API_URL || '').replace(/\/+$/, ''); // sin slash final

// ====== Storage helpers ======
const TOKEN_KEY = 'token';
const USER_KEY = 'userData';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// ====== JWT helpers ======
const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(
            atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        if (!payload?.exp) return false;
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

// ====== Core request ======
const request = async (endpoint, { method = 'GET', data, auth = false, headers = {}, signal } = {}) => {
    const url = `${API_URL}/${String(endpoint).replace(/^\/+/, '')}`;

    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        signal,
    };

    if (auth) {
        const token = getToken();
        if (token) {
            opts.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    if (data !== undefined && data !== null) {
        opts.body = JSON.stringify(data);
    }

    const res = await fetch(url, opts);

    // intenta parsear JSON siempre que sea posible
    let body;
    try {
        body = await res.json();
    } catch {
        body = null;
    }

    if (!res.ok) {
        // 401 -> limpiar sesión
        if (res.status === 401) clearSession();

        const message =
            (body && (body.message || body.error || body.msg)) ||
            `Error ${res.status}: ${res.statusText}`;

        const err = new Error(message);
        err.status = res.status;
        err.details = body;
        throw err;
    }

    return body;
};

// ====== Shorthands ======
export const getData = (endpoint, auth = false, headers = {}) =>
    request(endpoint, { method: 'GET', auth, headers });

export const postData = (endpoint, data, auth = false, headers = {}) =>
    request(endpoint, { method: 'POST', data, auth, headers });

export const putData = (endpoint, data, auth = false, headers = {}) =>
    request(endpoint, { method: 'PUT', data, auth, headers });

export const deleteData = (endpoint, auth = false, headers = {}) =>
    request(endpoint, { method: 'DELETE', auth, headers });

// ====== Auth ======
export const login = async (credentials) => {
    console.log('Credenciales: ', credentials);
    // No logeamos credenciales en producción
    const resp = await postData('auth/login', credentials, false);

    // Soporta diferentes llaves según API
    const token = resp.token || resp.access_token || resp.jwt;
    if (token) setToken(token);

    // Normaliza nombres y rol/tipo
    const nombres = resp.nombres || resp.Nombres || resp.name || 'usuario';
    const tipousuario =
        resp.tipousuario ||
        resp.TipoUsuario ||
        resp.rol ||
        resp.Rol ||
        'INVITADO';

    const userData = { nombres, tipousuario };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    return resp;
};

export const logout = () => clearSession();

export const getUserData = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || { nombres: 'Usuario', tipousuario: 'INVITADO' };
    } catch {
        return { nombres: 'Usuario', tipousuario: 'INVITADO' };
    }
};

export const isAuthenticated = () => {
    const t = getToken();
    return isTokenValid(t);
};
