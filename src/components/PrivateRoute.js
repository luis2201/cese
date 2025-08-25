import { Navigate, useLocation } from 'react-router-dom';

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.exp) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token || !isTokenValid(token)) {
    // limpia por si hay token inválido/expirado
    localStorage.removeItem('token');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
