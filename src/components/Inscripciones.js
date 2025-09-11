import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, deleteData, putData } from '../services/apiService';
import Swal from 'sweetalert2';
import Layout from './Layout';

const formatDate = (isoLike) => {
  if (!isoLike) return '';
  const d = new Date(isoLike);
  if (isNaN(d.getTime())) return String(isoLike);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

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

  const toStr = (v) => String(v ?? '').toLowerCase();
  const filtrar = (r) => {
    const s = (filtro || '').toLowerCase().trim();
    if (!s) return true;
    const estadoTxt = Number(r.estado) === 1 ? 'aprobada' : 'pendiente';
    return (
      toStr(r.idinscripcion).includes(s) ||
      toStr(r.numero_matricula).includes(s) ||
      toStr(r.estudiante).includes(s) ||
      toStr(r.fecha_inscripcion).includes(s) ||
      estadoTxt.includes(s)
    );
  };

  const onRechazar = async (id) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: '¿Rechazar inscripción?',
      text: 'Esta acción eliminará la inscripción.',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
    }).then(r => r.isConfirmed);
    if (!ok) return;

    try {
      await deleteData(`inscripciones/${id}`, true); // mismo endpoint de eliminar
      await Swal.fire({ icon: 'success', title: 'Inscripción rechazada', timer: 900, showConfirmButton: false });
      cargar();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'No se pudo rechazar', text: e?.message || 'Error' });
    }
  };

  const onAprobar = async (id) => {
    const ok = await Swal.fire({
      icon: 'question',
      title: '¿Aprobar inscripción?',
      text: 'La inscripción pasará a estado Aprobada.',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    }).then(r => r.isConfirmed);
    if (!ok) return;

    try {
      // patrón acordado: PUT /inscripciones/:id/activ
      await putData(`inscripciones/${id}/activ`, null, true);
      await Swal.fire({ icon: 'success', title: 'Inscripción aprobada', timer: 900, showConfirmButton: false });
      cargar();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'No se pudo aprobar', text: e?.message || 'Error' });
    }
  };

  const safeRows = Array.isArray(rows) ? rows : [];
  const filteredRows = safeRows.filter(filtrar);

  return (
    <Layout>
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-eco-700">Inscripciones</h2>
        <button className="btn-primary" onClick={() => navigate('/inscripciones/agregar')}>
          Agregar
        </button>
      </div>

      {/* Filtro */}
      <div className="card mb-6">
        <input
          className="input"
          placeholder="Buscar por matrícula, estudiante, fecha o estado…"
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
              <button className="btn-primary" onClick={() => navigate('/inscripciones/agregar')}>
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
                  <th className="px-4 py-2 text-left">Matrícula</th>
                  <th className="px-4 py-2 text-left">Estudiante</th>
                  <th className="px-4 py-2 text-left">Fecha de inscripción</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRows.map((r) => {
                  const rowId = r?.idinscripcion;
                  const isAprobada = Number(r?.estado) === 1;
                  return (
                    <tr key={rowId} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{rowId}</td>
                      <td className="px-4 py-2">{r?.numero_matricula}</td>
                      <td className="px-4 py-2">{r?.estudiante}</td>
                      <td className="px-4 py-2">{formatDate(r?.fecha_inscripcion)}</td>
                      <td className="px-4 py-2">
                        {isAprobada ? (
                          <span className="inline-flex items-center rounded-full bg-eco-600/10 px-2 py-0.5 text-xs font-semibold text-eco-600">
                            Aprobada
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-600">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          {/* Aprobar si está pendiente */}
                          {!isAprobada && (
                            <button
                              className="px-3 py-1 rounded-md bg-eco-600 text-white text-xs font-semibold hover:bg-eco-700 transition"
                              onClick={() => onAprobar(rowId)}
                            >
                              Aprobar
                            </button>
                          )}

                          {/* Rechazar (usa delete) siempre disponible */}
                          <button
                            className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                            onClick={() => onRechazar(rowId)}
                          >
                            Rechazar
                          </button>

                          {/* Editar (opcional) */}
                          <button
                            className="px-3 py-1 rounded-md bg-yellow-400 text-white text-xs font-semibold hover:bg-yellow-500 transition"
                            onClick={() => navigate(`/inscripciones/editar/${rowId}`)}
                          >
                            Editar
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
