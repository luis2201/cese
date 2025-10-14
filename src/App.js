import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Configuraciones from './components/Configuraciones';
import ConfiguracionForm from './components/ConfiguracionForm';
import Inscripciones from './components/Inscripciones';
import Usuarios from './components/Usuarios';
import UsuariosForm from './components/UsuariosForm';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL || '/'}>
      <Routes>
        {/* Home -> login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas (redirige si ya hay sesión) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Rutas privadas */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/configuraciones" element={<PrivateRoute><Configuraciones /></PrivateRoute>} />
        <Route path="/configuraciones/agregar" element={<PrivateRoute><ConfiguracionForm /></PrivateRoute>} />
        <Route path="/configuraciones/editar/:id" element={<PrivateRoute><ConfiguracionForm /></PrivateRoute>} />
        <Route path="/configuraciones" element={<PrivateRoute><Configuraciones /></PrivateRoute>} />
        <Route path="/inscripciones" element={<PrivateRoute><Inscripciones /></PrivateRoute>} /> 
        <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
        <Route path="/usuarios/agregar" element={<PrivateRoute><UsuariosForm /></PrivateRoute>} />
        <Route path="/usuarios/editar/:id" element={<PrivateRoute><UsuariosForm /></PrivateRoute>} />
        {/* 404 -> login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
