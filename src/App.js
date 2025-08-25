import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL || '/'}>
      <Routes>
        {/* Home -> login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas (redirige si ya hay sesión) */}
        <Route 
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Rutas privadas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* 404 -> login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
