import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { getUserData, logout } from '../services/apiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faRightFromBracket, faGauge } from '@fortawesome/free-solid-svg-icons';
import Menu from './Menu';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const { nombres = 'Usuario', tipousuario = 'INVITADO' } = getUserData() || {};

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand">
                    <NavLink to="/dashboard" className="brand-link">
                        <FontAwesomeIcon icon={faGauge} /> <span>CESE</span>
                    </NavLink>
                </div>
                <div className="userbox">
                    <span className="welcome">Bienvenido, <strong>{nombres}</strong></span>
                    <div className="dropdown">
                        <button className="dropdown-btn" aria-haspopup="true" aria-expanded="false">
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <div className="dropdown-menu">
                            <div className="dropdown-item muted">Rol: <strong>{tipousuario}</strong></div>
                            <button className="dropdown-item danger" onClick={handleLogout}>
                                <FontAwesomeIcon icon={faRightFromBracket} /> Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="app-body">
                <aside className="sidebar">
                    <Menu />
                </aside>
                <main className="content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
