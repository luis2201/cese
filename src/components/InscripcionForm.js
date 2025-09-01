import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getData, postData, putData } from '../services/apiService';
import Swal from 'sweetalert2';
import Layout from './Layout';

const InscripcionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [periodos, setPeriodos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [form, setForm] = useState({
    idperiodo: '',
    idcarrera: '',
    iddocente: '',
    horas_requeridas: '',
    estado: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargarSelects = async () => {
    try {
      const [p, c, d] = await Promise.all([
        getData('periodos', true),
        getData('carreras', true),
        getData('docentes', true),
      ]);
      setPeriodos(Array.isArray(p) ? p : []);
      setCarreras(Array.isArray(c) ? c : []);
      setDocentes(Array.isArray(d) ? d : []);
    } catch {
      setPeriodos([]);
      setCarreras([]);
      setDocentes([]);
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
          estado: Number(data.estado ?? 1),
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
    if (form.horas_requeridas === '' || Number(form.horas_requeridas) <= 0)
      return 'Ingrese horas requeridas (> 0)';
    return null;
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
        estado: Number(form.estado),
      };

      if (id) {
        await putData(`inscripciones/${id}`, payload, true);
        await Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        await postData('inscripciones', payload, true);
        await Swal.fire({
          icon: 'success',
          title: 'Registrado',
          timer: 1000,
          showConfirmButton: false,
        });
      }
      navigate('/inscripciones', { replace: true });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: err?.message || 'Error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-extrabold text-eco-700 mb-4">
        {id ? 'Editar' : 'Agregar'} Inscripción
      </h2>

      <div className="card">
        {loading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className="grid gap-4 md:grid-cols-2"
          >
            {/* Periodo */}
            <div>
              <label className="label">Periodo</label>
              <select
                name="idperiodo"
                value={form.idperiodo}
                onChange={onChange}
                className="select"
              >
                <option value="">Seleccione…</option>
                {periodos
                  .filter((p) => Number(p.estado ?? 1) === 1)
                  .map((p) => (
                    <option key={p.idperiodo ?? p.id} value={p.idperiodo ?? p.id}>
                      {p.periodo ?? p.nombre ?? `${p.anio ?? ''} ${p.nombre ?? ''}`}
                    </option>
                  ))}
              </select>
            </div>

            {/* Carrera */}
            <div>
              <label className="label">Carrera</label>
              <select
                name="idcarrera"
                value={form.idcarrera}
                onChange={onChange}
                className="select"
              >
                <option value="">Seleccione…</option>
                {carreras
                  .filter((c) => Number(c.estado ?? 1) === 1)
                  .map((c) => (
                    <option key={c.idcarrera ?? c.id} value={c.idcarrera ?? c.id}>
                      {c.carrera ?? c.nombre}
                    </option>
                  ))}
              </select>
            </div>

            {/* Docente */}
            <div>
              <label className="label">Docente</label>
              <select
                name="iddocente"
                value={form.iddocente}
                onChange={onChange}
                className="select"
              >
                <option value="">Seleccione…</option>
                {docentes
                  .filter((d) => Number(d.estado ?? 1) === 1)
                  .map((d) => (
                    <option key={d.iddocente ?? d.id} value={d.iddocente ?? d.id}>
                      {d.docente ?? d.nombres ?? d.nombre}
                    </option>
                  ))}
              </select>
            </div>

            {/* Horas requeridas */}
            <div>
              <label className="label">Horas requeridas</label>
              <input
                type="number"
                name="horas_requeridas"
                value={form.horas_requeridas}
                onChange={onChange}
                min={1}
                className="input"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="label">Estado</label>
              <select
                name="estado"
                value={form.estado}
                onChange={onChange}
                className="select"
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>

            {/* Botones */}
            <div className="md:col-span-2 flex gap-2 mt-4">
              <button type="submit" className="btn-primary" disabled={saving}>
                {id ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/inscripciones')}
              >
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
