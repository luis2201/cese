import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getData } from '../services/apiService';

/**
 * Estructura esperada:
 * [{ ID: 1, Rol: 'ADMINCESE', Menu: 'Dashboard', Ruta: '/dashboard', ParentID: null }, ...]
 */

function buildTree(items) {
    const byId = new Map();
    items.forEach(it => byId.set(it.ID, { ...it, children: [] }));

    const roots = [];
    items.forEach(it => {
        if (it.ParentID == null) {
            roots.push(byId.get(it.ID));
        } else if (byId.has(it.ParentID)) {
            byId.get(it.ParentID).children.push(byId.get(it.ID));
        } else {
            // si ParentID no existe, trátalo como root para no perderlo
            roots.push(byId.get(it.ID));
        }
    });

    // Orden opcional por Menu
    const sortRec = (nodes) => {
        nodes.sort((a, b) => a.Menu.localeCompare(b.Menu));
        nodes.forEach(n => sortRec(n.children));
    };
    sortRec(roots);

    return roots;
}

const MenuItem = ({ node, onClick, activePath }) => {
    const isDisabled = !node.Ruta || String(node.Ruta).trim() === '' || node.Ruta === 'NULL';
    const isActive = !isDisabled && activePath === node.Ruta;

    return (
        <li className={`menu-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}>
            <button
                type="button"
                className="menu-link"
                onClick={() => !isDisabled && onClick(node.Ruta)}
                disabled={isDisabled}
                title={node.Menu}
            >
                <span>{node.Menu}</span>
            </button>

            {node.children && node.children.length > 0 && (
                <ul className="submenu">
                    {node.children.map(child => (
                        <MenuItem
                            key={child.ID}
                            node={child}
                            onClick={onClick}
                            activePath={activePath}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default function Menu() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // La API debe devolver los menús para el rol del usuario del token
                const data = await getData('permissions/menus', true);
                console.log(data);  
                if (mounted && Array.isArray(data)) {
                    setItems(data);
                }
            } catch (e) {
                // Si falla, dejamos un menú vacío
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const tree = useMemo(() => buildTree(items), [items]);

    const handleNav = (ruta) => {
        // Navega solo si hay ruta válida
        if (ruta && ruta !== 'NULL') {
            navigate(ruta);
        }
    };

    if (loading) {
        return <nav className="menu">Cargando menú…</nav>;
    }

    return (
        <nav className="menu" aria-label="Menú principal">
            <ul className="menu-root">
                {tree.map(node => (
                    <MenuItem
                        key={node.ID}
                        node={node}
                        onClick={handleNav}
                        activePath={location.pathname}
                    />
                ))}
            </ul>
        </nav>
    );
}
