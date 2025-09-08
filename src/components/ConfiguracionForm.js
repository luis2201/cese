import React, { useEffect, useRef, useState } from 'react';
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

  // flags de error por campo
  const [errors, setErrors] = useState({
    idperiodo: false,
    idcarrera: false,
    iddocente: false,
    horas_requeridas: false,
  });

  // refs para enfocar el primer campo inválido
  const periodoRef = useRef(null);
  const carreraRef = useRef(null);
  const docenteRef = useRef(null);
  const horasRef = useRef(null);

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
    // al escribir/seleccionar, limpiar error de ese campo
    setErrors((err) => ({ ...err, [name]: false }));
  };

  const validarYMarcar = () => {
    const nuevo = {
      idperiodo: !String(form.idperiodo).trim(),
      idcarrera: !String(form.idcarrera).trim(),
      iddocente: !String(form.iddocente).trim(),
      horas_requeridas: form.horas_requeridas === '' || Number(form.horas_requeridas) <= 0,
    };
    setErrors(nuevo);

    // enfocar el primer campo inválido
    if (nuevo.idperiodo && periodoRef.current) periodoRef.current.focus();
    else if (nuevo.idcarrera && carreraRef.current) carreraRef.current.focus();
    else if (nuevo.iddocente && docenteRef.current) docenteRef.current.focus();
    else if (nuevo.horas_requeridas && horasRef.current) horasRef.current.focus();

    // mensaje general
    const keysInvalidas = Object.keys(nuevo).filter((k) => nuevo[k]);
    if (keysInvalidas.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor, complete los campos requeridos.',
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!validarYMarcar()) return;

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

  // estilos de error (añade borde y halo rojo, y fondo suave)
  const errCls = 'border-red-500 ring-2 ring-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50';

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-extrabold text-eco-700 mb-3">
          {id ? 'Editar Inscripción' : 'Agregar Inscripción'}
        </h2>

        <div className="card">
          <div className="mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-lg font-semibold text-ink">Datos de la inscripción</h3>
            <p className="text-sm text-muted">
              Complete los campos requeridos (<span className="text-red-600">*</span>).
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando…</p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Periodo */}
                <div>
                  <label className="label">
                    Periodo <span className="text-red-600">*</span>
                  </label>
                  <select
                    ref={periodoRef}
                    name="idperiodo"
                    value={form.idperiodo}
                    onChange={onChange}
                    className={`select ${errors.idperiodo ? errCls : ''}`}
                    aria-invalid={errors.idperiodo || undefined}
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
                  <label className="label">
                    Carrera <span className="text-red-600">*</span>
                  </label>
                  <select
                    ref={carreraRef}
                    name="idcarrera"
                    value={form.idcarrera}
                    onChange={onChange}
                    className={`select ${errors.idcarrera ? errCls : ''}`}
                    aria-invalid={errors.idcarrera || undefined}
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
                  <label className="label">
                    Docente <span className="text-red-600">*</span>
                  </label>
                  <select
                    ref={docenteRef}
                    name="iddocente"
                    value={form.iddocente}
                    onChange={onChange}
                    className={`select ${errors.iddocente ? errCls : ''}`}
                    aria-invalid={errors.iddocente || undefined}
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
                  <label className="label">
                    Horas requeridas <span className="text-red-600">*</span>
                  </label>
                  <input
                    ref={horasRef}
                    type="number"
                    name="horas_requeridas"
                    value={form.horas_requeridas}
                    onChange={onChange}
                    min={1}
                    className={`input ${errors.horas_requeridas ? errCls : ''}`}
                    placeholder="Ej. 120"
                    aria-invalid={errors.horas_requeridas || undefined}
                  />
                </div>

                {/* Estado */}
                <div className="md:col-span-2 md:max-w-xs">
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
              </div>

              {/* Botonera */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
                  {id ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="btn-secondary w-full sm:w-auto"
                  onClick={() => navigate('/inscripciones')}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InscripcionForm;
