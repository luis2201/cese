import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getData, postData, putData } from '../services/apiService';
import Swal from 'sweetalert2';
import Layout from './Layout';

const InscripcionForm = () => {
  const { id } = useParams(); // si existe -> editar
  const navigate = useNavigate();

  // Selects
  const [periodos, setPeriodos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [docentes, setDocentes] = useState([]);

  // Modelo según tu tabla (imagen compartida)
  const [form, setForm] = useState({
    idperiodo: '',
    idcarrera: '',
    iddocente: '',
    horas_requeridas: '',
    estado: 1
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargarSelects = async () => {
    try {
      const [p, c, d] = await Promise.all([
        getData('periodos', true),
        getData('carreras', true),
        getData('docentes', true)
      ]);
      setPeriodos(Array.isArray(p) ? p : []);
      setCarreras(Array.isArray(c) ? c : []);
      setDocentes(Array.isArray(d) ? d : []);
    } catch {
      setPeriodos([]); setCarreras([]); setDocentes([]);
    }
  };

  const cargarRegistro = async () => {
    if (!id) return;
    try {
      const data = await getData(`inscripciones/${id}`, true);
      if (data) {
        setForm({
          idperiodo: data.idperiodo ?? '',
          idcarrera: data.idcarrera ?? '',
          iddocente: data.iddocente ?? '',
          horas_requeridas: data.horas_requeridas ?? '',
          estado: Number(data.estado ?? 1)
        });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar el registro' });
    }
  };

  useEffect(() => {
    (async () => {
      await cargarSelects();
      await cargarRegistro();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validar = () => {
    if (!String(form.idperiodo).trim()) return 'Seleccione un periodo';
    if (!String(form.idcarrera).trim()) return 'Seleccione una carrera';
    if (!String(form.iddocente).trim()) return 'Seleccione un docente';
    if (form.horas_requeridas === '' || Number(form.horas_requeridas) <= 0) return 'Ingrese horas requeridas (> 0)';
    return null;
    // estado: 0/1 – ya tiene default
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const error = validar();
    if (error) {
      Swal.fire({ icon: 'warning', title: 'Validación', text: error });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        idperiodo: Number(form.idperiodo),
        idcarrera: Number(form.idcarrera),
        iddocente: Number(form.iddocente),
        horas_requeridas: Number(form.horas_requeridas),
        estado: Number(form.estado)
      };

      if (id) {
        await putData(`inscripciones/${id}`, payload, true);
        await Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1000, showConfirmButton: false });
      } else {
        await postData('inscripciones', payload, true);
        await Swal.fire({ icon: 'success', title: 'Registrado', timer: 1000, showConfirmButton: false });
      }
      navigate('/inscripciones', { replace: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: err?.message || 'Error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h2 className="h1">{id ? 'Editar' : 'Agregar'} Inscripción</h2>

      <div className="card">
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <form onSubmit={onSubmit} className="form" noValidate>
            {/* Periodo */}
            <label className="input-group">
              <span className="icon">Periodo</span>
              <select name="idperiodo" value={form.idperiodo} onChange={onChange}>
                <option value="">Seleccione…</option>
                {periodos
                  .filter(p => Number(p.estado ?? 1) === 1) // solo activos si aplica
                  .map(p => (
                    <option key={p.idperiodo ?? p.id} value={p.idperiodo ?? p.id}>
                      {p.periodo ?? p.nombre ?? `${p.anio ?? ''} ${p.nombre ?? ''}`}
                    </option>
                  ))}
              </select>
            </label>

            {/* Carrera */}
            <label className="input-group">
              <span className="icon">Carrera</span>
              <select name="idcarrera" value={form.idcarrera} onChange={onChange}>
                <option value="">Seleccione…</option>
                {carreras
                  .filter(c => Number(c.estado ?? 1) === 1)
                  .map(c => (
                    <option key={c.idcarrera ?? c.id} value={c.idcarrera ?? c.id}>
                      {c.carrera ?? c.nombre}
                    </option>
                  ))}
              </select>
            </label>

            {/* Docente */}
            <label className="input-group">
              <span className="icon">Docente</span>
              <select name="iddocente" value={form.iddocente} onChange={onChange}>
                <option value="">Seleccione…</option>
                {docentes
                  .filter(d => Number(d.estado ?? 1) === 1)
                  .map(d => (
                    <option key={d.iddocente ?? d.id} value={d.iddocente ?? d.id}>
                      {d.docente ?? d.nombres ?? d.nombre}
                    </option>
                  ))}
              </select>
            </label>

            {/* Horas */}
            <label className="input-group">
              <span className="icon">Horas requeridas</span>
              <input
                type="number"
                name="horas_requeridas"
                value={form.horas_requeridas}
                onChange={onChange}
                min={1}
              />
            </label>

            {/* Estado */}
            <label className="input-group">
              <span className="icon">Estado</span>
              <select name="estado" value={form.estado} onChange={onChange}>
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </label>

            <div className="d-flex" style={{gap:10, marginTop:6}}>
              <button type="submit" className="btn-submit" disabled={saving}>
                {id ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" className="dropdown-item" onClick={() => navigate('/inscripciones')}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default InscripcionForm;
