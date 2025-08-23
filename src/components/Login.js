import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/apiService';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Logos Institucionales
import logoEco from '/images/logo_eco.png';
import logoITSUP from '/images/logo_itsup.png';

// Hoja de estilo para login
import '/css/login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ Usuario: '', Contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!credentials.Usuario.trim() || !credentials.Contrasena.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos.',
        confirmButtonText: 'Entendido'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await login(credentials);
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Autenticación exitosa.',
        timer: 1200,
        showConfirmButton: false
      });
      // leve delay para permitir ver el alerta
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No fue posible iniciar sesión',
        text: 'Credenciales incorrectas o problema en el servidor.',
        confirmButtonText: 'Reintentar'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      {/* Círculos decorativos */}
      <span className="decor decor-1" />
      <span className="decor decor-2" />

      <div className="card-login" role="main" aria-labelledby="titulo-login">
        <div className="brand-strip">
          <img src={logoEco} alt="Proyecto ECO ITSUP" className="brand-logo" />
          <div className="divider" />
          <img src={logoITSUP} alt="ITSUP Portoviejo" className="brand-logo" />
        </div>

        <h1 id="titulo-login" className="title">Iniciar Sesión</h1>
        <p className="subtitle">Accede con tu usuario institucional</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="input-group" aria-label="Usuario">
            <span className="icon">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              type="text"
              name="Usuario"
              placeholder="Usuario"
              value={credentials.Usuario}
              onChange={handleChange}
              disabled={loading}
              autoComplete="username"
            />
          </label>

          <label className="input-group" aria-label="Contraseña">
            <span className="icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={showPass ? 'text' : 'password'}
              name="Contrasena"
              placeholder="Contraseña"
              value={credentials.Contrasena}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              disabled={loading}
            >
              <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
            </button>
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Iniciar Sesión'}
          </button>
        </form>

        <footer className="footnote">
          <small>© ITSUP Portoviejo — Proyecto ECO</small>
        </footer>
      </div>
    </div>
  );
};

export default Login;
