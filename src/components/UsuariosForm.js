import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getData, postData, putData } from '../services/apiService';
import Swal from 'sweetalert2';
import Layout from './Layout';

const UsuariosForm = () => {
  const [form, setForm] = useState({
    nombres: '',
    usuario: '',
    tipousuario: '',
    correo: '',
    //telefono: '',
    contrasena: '',
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const modoEdicion = Boolean(id);

  const cargar = async () => {
    if (!modoEdicion) return;
    try {
      const data = await getData(`usuarios-cese/${id}`, true);
      setForm(data || {});
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: 'error', title: 'Error al cargar usuario' });
    }
  };

  useEffect(() => { cargar(); }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombres, usuario, tipousuario, contrasena } = form;

    if (!nombres || !usuario || !tipousuario || (!modoEdicion && !contrasena)) {
      return Swal.fire({ icon: 'warning', title: 'Faltan campos obligatorios' });
    }

    try {
      setLoading(true);
      if (modoEdicion) {
        await putData(`usuarios-cese/${id}`, form, true);
        Swal.fire({ icon: 'success', title: 'Usuario actualizado' });
      } else {
        await postData('usuarios-cese', form, true);
        Swal.fire({ icon: 'success', title: 'Usuario creado' });
      }
      navigate('/usuarios');
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo guardar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">
          {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombres</label>
            <input className="input" name="nombres" value={form.nombres} onChange={handleChange} required />
          </div>

          <div>
            <label className="label">Usuario</label>
            <input className="input" name="usuario" value={form.usuario} onChange={handleChange} required />
          </div>

          <div>
            <label className="label">Correo</label>
            <input className="input" name="correo" value={form.correo} onChange={handleChange} />
          </div>

          {/* <div>
            <label className="label">TelÃ©fono</label>
            <input className="input" name="telefono" value={form.telefono} onChange={handleChange} />
          </div> */}

          <div>
            <label className="label">Rol</label>
            <select className="input" name="tipousuario" value={form.tipousuario} onChange={handleChange} required>
              <option value="">-- Selecciona --</option>
              <option value="ADMINCESE">ADMINCESE</option>
              <option value="DOCENTE">DOCENTE</option>
              <option value="USUARIOCESE">USUARIOCESE</option>
            </select>
          </div>

          {!modoEdicion && (
            <div>
              <label className="label">Contraseña</label>
              <input className="input" name="contrasena" value={form.contrasena} onChange={handleChange} type="password" required />
            </div>
          )}

          <div className="col-span-full flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/usuarios')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {modoEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UsuariosForm;