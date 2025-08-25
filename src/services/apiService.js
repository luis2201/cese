import config from '../config';

const API_URL = config.API_URL;

// Almacenamiento del token
const getToken = () => localStorage.getItem('token');

// Realizar peticiones a la API
const request = async (endpoint, method = 'GET', data = null, auth = false, headers = {}) => {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (auth) {
            const token = getToken();
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}/${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        throw error;
    }
};

// Funciones para interactuar con la API
export const getData = async (endpoint, auth = false) => {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (auth) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found for authenticated request');
            return null;
        }
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }
    catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
};

export const postData = (endpoint, data, auth = false) => request(endpoint, 'POST', data, auth);
export const putData = (endpoint, data, auth = false) => request(endpoint, 'PUT', data, auth);
export const deleteData = (endpoint, auth = false) => request(endpoint, 'DELETE', null, auth);

export const login = async (credentials) => {
    try {
        const response = await postData('auth/login', credentials);

        if (response.token && response.nombres && response.tipousuario) {
            localStorage.setItem('token', response.token);
            localStorage.setItem(
                'userData',
                JSON.stringify({
                    nombres: response.nombres,
                    tipousuario: response.tipousuario
                })
            );
        }

        return response;
    } catch (error) {
        console.error('Login error:', error.message || error);
        throw error;
    }
};



// Datos del usuario autenticado
export const getUserData = () => {
    try {
        return JSON.parse(localStorage.getItem('userData')) || { nombres: 'Usuario', tipousuario: 'INVITADO' };
    } catch {
        return { nombres: 'Usuario', tipousuario: 'INVITADO' };
    }
};

// Cerrar sesión
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => !!getToken();