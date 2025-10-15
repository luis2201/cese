import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, deleteData, putData } from '../services/apiService';
import Swal from 'sweetalert2';
import Layout from './Layout';

const Usuarios = () => {
  const [rows, setRows] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getData('usuarios-cese', true);
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
    return (
      toStr(r.idusuario).includes(s) ||
      toStr(r.nombres).includes(s) ||
      toStr(r.usuario).includes(s) ||
      toStr(r.tipousuario).includes(s) ||
      toStr(r.correo).includes(s) ||
      toStr(Number(r.estado) === 1 ? 'activo' : 'inactivo').includes(s)
    );
  };

  const onEliminar = async (id) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar usuario?',
      text: 'Esto desactivará el acceso del usuario.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((r) => r.isConfirmed);
    if (!ok) return;

    try {
      await deleteData(`usuarios-cese/${id}`, true);
      await Swal.fire({ icon: 'success', title: 'Eliminado', timer: 900, showConfirmButton: false });
      cargar();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'No se pudo eliminar', text: e?.message || 'Error' });
    }
  };

  const safeRows = Array.isArray(rows) ? rows : [];
  const filteredRows = safeRows.filter(filtrar);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-eco-700">Usuarios</h2>
        <button
          className="btn-primary"
          onClick={() => navigate('/usuarios/agregar')}
        >
          Agregar
        </button>
      </div>

      <div className="card mb-6">
        <input
          className="input"
          placeholder="Buscar por nombre, usuario, correo, rol…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : filteredRows.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">No se encontraron resultados.</p>
            <div className="mt-3">
              <button
                className="btn-primary"
                onClick={() => navigate('/usuarios/agregar')}
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
                  <th className="px-4 py-2 text-left">Nombres</th>
                  <th className="px-4 py-2 text-left">Usuario</th>
                  <th className="px-4 py-2 text-left">Correo</th>
                  <th className="px-4 py-2 text-left">Rol</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRows.map((r) => (
                  <tr key={r.idusuario} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{r.idusuario}</td>
                    <td className="px-4 py-2">{r.nombres}</td>
                    <td className="px-4 py-2">{r.usuario}</td>
                    <td className="px-4 py-2">{r.correo}</td>
                    <td className="px-4 py-2">{r.tipousuario}</td>
                    <td className="px-4 py-2">
                      {Number(r.estado) === 1 ? (
                        <span className="inline-flex items-center rounded-full bg-eco-600/10 px-2 py-0.5 text-xs font-semibold text-eco-600">Activo</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-600/10 px-2 py-0.5 text-xs font-semibold text-red-600">Inactivo</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        {Number(r.estado) === 0 && (
                          <button
                            className="px-3 py-1 rounded-md bg-eco-600 text-white text-xs font-semibold hover:bg-eco-700 transition"
                            onClick={async () => {
                              const ok = await Swal.fire({
                                icon: 'question',
                                title: '¿Activar usuario?',
                                showCancelButton: true,
                                confirmButtonText: 'Sí, activar',
                                cancelButtonText: 'Cancelar',
                              }).then(res => res.isConfirmed);
                              if (!ok) return;
                              try {
                                await putData(`usuarios-cese/${r.idusuario}/activar`, { estado: 1 }, true);
                                await Swal.fire({ icon: 'success', title: 'Activado', timer: 900, showConfirmButton: false });
                                cargar();
                              } catch (err) {
                                Swal.fire({ icon: 'error', title: 'Error al activar', text: err?.message || 'Error' });
                              }
                            }}
                          >
                            Activar
                          </button>
                        )}

                        <button
                          className="px-3 py-1 rounded-md bg-yellow-400 text-white text-xs font-semibold hover:bg-yellow-500 transition"
                          onClick={() => navigate(`/usuarios/editar/${r.idusuario}`)}
                        >
                          Editar
                        </button>

                        {Number(r.estado) === 1 && (
                          <button
                            className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                            onClick={() => onEliminar(r.idusuario)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Usuarios;