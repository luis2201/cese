import config from '../config';

const API_URL = config.API_URL;

// Almacenamiento del token
const getToken = () => localStorage.getItem('token');

// Realizar peticiones a la API
const request = async (endpoint, method = 'GET', data = null, auth = false, headers = {}) => {
    try{

    } 
    catch (error) {        
        throw error;
    }
}