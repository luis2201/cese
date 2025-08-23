import React, { useState } from 'react';
import { login } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
    const [credentials, setCredentials] = useState({ Usuario: '', Contrasena: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if(!credentials.Usuario.trim() || !credentials.Contrasena.trim()) {
            setError('Por favor, complete todos los campos');
            setLoading(false);
            return;
        }

        try {
            await login(credentials);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            setLoading(false);
            setError('Credenciales incorrectas o problema en el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <FontAwesomeIcon icon={faUser} />
                    <input
                        type="text"
                        name="Usuario"
                        placeholder="Usuario"
                        value={credentials.Usuario}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <FontAwesomeIcon icon={faLock} />
                    <input
                        type="password"
                        name="Contrasena"
                        placeholder="Contraseña"
                        value={credentials.Contrasena}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    );

};

export default Login;
