// src/components/Login.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../services/apiService';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const logoEco = process.env.PUBLIC_URL + '/images/logo_eco.png';
const logoITSUP = process.env.PUBLIC_URL + '/images/logo_itsup.png';

const Login = () => {
  const [credentials, setCredentials] = useState({ Usuario: '', Contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Trim suave: evita espacios accidentales a la izquierda
    setCredentials((prev) => ({ ...prev, [name]: value.replace(/^\s+/, '') }));
  };

  const validate = () => {
    if (!credentials.Usuario.trim() || !credentials.Contrasena.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, complete usuario y contraseña.',
        confirmButtonText: 'Entendido'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const resp = await login(credentials);

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Autenticación exitosa.',
        timer: 1000,
        showConfirmButton: false
      });

      // Pequeño delay para que se vea el toast
      setTimeout(() => navigate(redirectTo, { replace: true }), 700);
      return resp;
    } catch (err) {
      const msg =
        err?.details?.message ||
        err?.details?.error ||
        err?.message ||
        'Credenciales incorrectas o problema en el servidor.';
      Swal.fire({
        icon: 'error',
        title: 'No fue posible iniciar sesión',
        text: msg,
        confirmButtonText: 'Reintentar'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
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

        <form onSubmit={handleSubmit} className="form" noValidate>
          <label className="input-group" aria-label="Usuario">
            <span className="icon">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              type="text"
              name="usuario"
              placeholder="Usuario"
              value={credentials.usuario}
              onChange={handleChange}
              disabled={loading}
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className="input-group" aria-label="Contraseña">
            <span className="icon">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={showPass ? 'text' : 'password'}
              name="contrasena"
              placeholder="Contraseña"
              value={credentials.contrasena}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              disabled={loading}
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
            </button>
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Iniciar Sesión'}
          </button>
        </form>

        <footer className="footnote">
          <small>© ITSUP Portoviejo — CESE</small>
        </footer>
      </div>
    </div>
  );
};

export default Login;
