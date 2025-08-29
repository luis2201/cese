import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, deleteData } from '../services/apiService';
import Swal from 'sweetalert2';
import Layout from './Layout';

const Inscripciones = () => {
  const [rows, setRows] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getData('inscripciones', true);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrar = (r) => {
    if (!filtro.trim()) return true;
    const s = filtro.toLowerCase();
    return (
      String(r.idconfiguracion ?? r.idinscripcion ?? '').includes(s) ||
      String(r.periodo ?? r.idperiodo ?? '').toLowerCase().includes(s) ||
      String(r.carrera ?? r.idcarrera ?? '').toLowerCase().includes(s) ||
      String(r.docente ?? r.iddocente ?? '').toLowerCase().includes(s)
    );
  };

  const onEliminar = async (id) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => r.isConfirmed);
    if (!ok) return;

    try {
      await deleteData(`inscripciones/${id}`, true);
      await Swal.fire({ icon: 'success', title: 'Eliminado', timer: 900, showConfirmButton: false });
      cargar();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: e?.message || 'Error' });
    }
  };

  return (
    <Layout>
      <div className="d-flex align-items-center justify-content-between" style={{marginBottom:12}}>
        <h2 className="h1" style={{margin:0}}>Inscripciones</h2>
        <button className="btn-submit" onClick={() => navigate('/inscripciones/agregar')}>Agregar</button>
      </div>

      <div className="card" style={{marginBottom:12}}>
        <input
          className="form-control"
          placeholder="Buscar por ID, periodo, carrera o docente…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Periodo</th>
                  <th>Carrera</th>
                  <th>Docente</th>
                  <th>Horas requeridas</th>
                  <th>Estado</th>
                  <th style={{width:160}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.filter(filtrar).map((r) => (
                  <tr key={r.idconfiguracion ?? r.idinscripcion}>
                    <td>{r.idconfiguracion ?? r.idinscripcion}</td>
                    <td>{r.periodo ?? r.idperiodo}</td>
                    <td>{r.carrera ?? r.idcarrera}</td>
                    <td>{r.docente ?? r.iddocente}</td>
                    <td>{r.horas_requeridas}</td>
                    <td>{Number(r.estado) === 1 ? 'Activo' : 'Inactivo'}</td>
                    <td>
                      <button className="dropdown-item" onClick={() => navigate(`/inscripciones/editar/${r.idconfiguracion ?? r.idinscripcion}`)}>
                        Editar
                      </button>
                      <button className="dropdown-item danger" onClick={() => onEliminar(r.idconfiguracion ?? r.idinscripcion)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan="7">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inscripciones;
