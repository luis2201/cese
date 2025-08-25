import { Navigate } from 'react-router-dom';

function isTokenValid(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload?.exp && payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function PublicRoute({ children }) {
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}
