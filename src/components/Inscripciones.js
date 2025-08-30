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

  useEffect(() => {
    cargar();
  }, []);

  const filtrar = (r) => {
    if (!filtro.trim()) return true;
    const s = filtro.toLowerCase();
    return (
      String(r.idconfiguracion ?? r.idinscripcion ?? '').toLowerCase().includes(s) ||
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

  const filteredRows = rows.filter(filtrar);

  return (
    <Layout>
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-eco-700">Inscripciones</h2>
        <button
          className="btn-primary"
          onClick={() => navigate('/inscripciones/agregar')}
        >
          Agregar
        </button>
      </div>

      {/* Filtro */}
      <div className="card mb-6">
        <input
          className="input"
          placeholder="Buscar por ID, periodo, carrera o docente…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* Tabla / Estados */}
      <div className="card">
        {loading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : filteredRows.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">No se encontraron resultados.</p>
            <div className="mt-3">
              <button
                className="btn-primary"
                onClick={() => navigate('/inscripciones/agregar')}
              >
                Agregar nuevo
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
              <thead className="bg-itsup-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Periodo</th>
                  <th className="px-4 py-2 text-left">Carrera</th>
                  <th className="px-4 py-2 text-left">Docente</th>
                  <th className="px-4 py-2 text-left">Horas requeridas</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRows.map((r) => {
                  const rowId = r.idconfiguracion ?? r.idinscripcion;
                  return (
                    <tr key={rowId} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{rowId}</td>
                      <td className="px-4 py-2">{r.periodo ?? r.idperiodo}</td>
                      <td className="px-4 py-2">{r.carrera ?? r.idcarrera}</td>
                      <td className="px-4 py-2">{r.docente ?? r.iddocente}</td>
                      <td className="px-4 py-2">{r.horas_requeridas}</td>
                      <td className="px-4 py-2">
                        {Number(r.estado) === 1 ? (
                          <span className="inline-flex items-center rounded-full bg-eco-600/10 px-2 py-0.5 text-xs font-semibold text-eco-600">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-semibold text-red-600">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="px-3 py-1 rounded-md bg-yellow-400 text-white text-xs font-semibold hover:bg-yellow-500 transition"
                            onClick={() => navigate(`/inscripciones/editar/${rowId}`)}
                          >
                            Editar
                          </button>
                          <button
                            className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                            onClick={() => onEliminar(rowId)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inscripciones;
