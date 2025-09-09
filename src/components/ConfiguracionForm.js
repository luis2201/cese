import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getData, postData, putData } from '../services/apiService';
import Swal from 'sweetalert2';
import Layout from './Layout';

const ConfiguracionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // catálogos
  const [periodos, setPeriodos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [docentes, setDocentes] = useState([]);

  // modelo
  const [form, setForm] = useState({
    idperiodo: '',
    idcarrera: '',
    iddocente: '',
    horas_requeridas: '',
  });

  // errores + refs para foco
  const [errors, setErrors] = useState({
    idperiodo: false,
    idcarrera: false,
    iddocente: false,
    horas_requeridas: false,
  });
  const periodoRef = useRef(null);
  const carreraRef = useRef(null);
  const docenteRef = useRef(null);
  const horasRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar catálogos básicos
  const cargarSelects = async () => {
    try {
      const [p, c] = await Promise.all([
        getData('periodos', true),
        getData('carreras', true),
      ]);
      setPeriodos(Array.isArray(p) ? p : []);
      setCarreras(Array.isArray(c) ? c : []);
    } catch {
      setPeriodos([]); setCarreras([]);
    }
  };

  // Cargar docentes según periodo + carrera
  const cargarDocentes = async (idperiodo, idcarrera) => {
    if (!idperiodo || !idcarrera) {
      setDocentes([]);
      return;
    }
    try {
      const data = await getData(`docentes/periodo/${idperiodo}/carrera/${idcarrera}`, true);
      setDocentes(Array.isArray(data) ? data : []);
    } catch {
      setDocentes([]);
    }
  };

  // Cargar registro al editar
  const cargarRegistro = async () => {
    if (!id) return;
    try {
      const data = await getData(`configuraciones/${id}`, true);
      if (data) {
        setForm({
          idperiodo: data.idperiodo ?? '',
          idcarrera: data.idcarrera ?? '',
          iddocente: data.iddocente ?? '',
          horas_requeridas: data.horas_requeridas ?? '',
        });

        // cargar docentes del periodo y carrera guardados
        await cargarDocentes(data.idperiodo, data.idcarrera);
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'No se pudo cargar la configuración' });
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

  // Cambios en los selects
  const onChange = async (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: false }));

    // cuando cambia periodo o carrera => reset docente y cargar lista
    if (name === 'idperiodo' || name === 'idcarrera') {
      const nuevoPeriodo = name === 'idperiodo' ? value : form.idperiodo;
      const nuevaCarrera = name === 'idcarrera' ? value : form.idcarrera;

      setForm((f) => ({ ...f, iddocente: '' }));
      await cargarDocentes(nuevoPeriodo, nuevaCarrera);
    }
  };

  // Validación
  const validarYMarcar = () => {
    const nuevo = {
      idperiodo: !String(form.idperiodo).trim(),
      idcarrera: !String(form.idcarrera).trim(),
      iddocente: !String(form.iddocente).trim(),
      horas_requeridas: form.horas_requeridas === '' || Number(form.horas_requeridas) <= 0,
    };
    setErrors(nuevo);

    if (nuevo.idperiodo && periodoRef.current) periodoRef.current.focus();
    else if (nuevo.idcarrera && carreraRef.current) carreraRef.current.focus();
    else if (nuevo.iddocente && docenteRef.current) docenteRef.current.focus();
    else if (nuevo.horas_requeridas && horasRef.current) horasRef.current.focus();

    if (Object.values(nuevo).some(Boolean)) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Complete los campos requeridos.' });
      return false;
    }
    return true;
  };

  // Guardar
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
      };

      if (id) {
        await putData(`configuraciones/${id}`, payload, true);
        await Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1000, showConfirmButton: false });
      } else {
        await postData('configuraciones', payload, true);
        await Swal.fire({ icon: 'success', title: 'Registrado', timer: 1000, showConfirmButton: false });
      }
      navigate('/configuraciones', { replace: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: err?.message || 'Error' });
    } finally {
      setSaving(false);
    }
  };

  const errCls = 'border-red-500 ring-2 ring-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50';

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-extrabold text-eco-700 mb-3">
          {id ? 'Editar Configuración' : 'Agregar Configuración'}
        </h2>

        <div className="card">
          <div className="mb-4 border-b border-gray-100 pb-3">
            <h3 className="text-lg font-semibold text-ink">Datos de la configuración</h3>
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
                  >
                    <option value="">Seleccione…</option>
                    {periodos
                      //.filter((p) => Number(p.estado ?? 1) === 1)
                      .map((p) => (
                        <option key={p.idperiodo} value={p.idperiodo}>
                          {p.periodo}
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
                  >
                    <option value="">Seleccione…</option>
                    {carreras
                      .filter((c) => Number(c.estado ?? 1) === 1 && (Number(c.idcarrera) === 35 || Number(c.idcarrera) === 50))
                      .map((c) => (
                        <option key={c.idcarrera} value={c.idcarrera}>
                          {c.carrera}
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
                          {d.docente ?? d.nombres ?? d.apellido1 + ' ' + d.apellido2 + ', ' + d.nombre1 + ' ' + d.nombre2}
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
                  />
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
                  onClick={() => navigate('/configuraciones')}
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

export default ConfiguracionForm;
