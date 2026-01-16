"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

/**
 * Tipado de sede
 */
interface Sede {
  _id: string;
  nombre: string;
}

/**
 * Tipado de colaborador
 */
interface Colaborador {
  _id: string;
  nombre: string;
  email: string;
}

/**
 * Tipado de servicio
 */
interface Servicio {
  _id: string;
  nombre: string;
  duracion: number;
  precio: number;
}

/**
 * Tipado de usuario
 */
interface Usuario {
  _id: string;
  nombre: string;
  email: string;
}

/**
 * Tipado de cita
 */
interface Cita {
  _id: string;
  usuario: Usuario;
  colaborador: Colaborador;
  servicio: Servicio;
  sede: Sede;
  fechaHora: string;
  fechaFin: string;
  estado: string;
}

const estadosCita = ["confirmada", "pendiente", "cancelada", "completada"];

export default function AdminCitasPage() {
  const { empresaSlug } = useParams();

  // ============================
  // ESTADOS
  // ============================

  const [citas, setCitas] = useState<Cita[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"crear" | "editar" | "eliminar" | null>(null);

  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  // Formulario
  const [usuarioId, setUsuarioId] = useState("");
  const [colaboradorId, setColaboradorId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [sedeId, setSedeId] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [estado, setEstado] = useState("confirmada");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);

  // ============================
  // CARGAR CITAS
  // ============================

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        const data = await api(`/api/citasxslug/${empresaSlug}/citas`);
        setCitas(data);
      } catch (error) {
        console.error("Error cargando citas", error);
      } finally {
        setLoading(false);
      }
    };

    if (empresaSlug) cargarCitas();
  }, [empresaSlug]);

  // ============================
  // CARGAR SEDES
  // ============================

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const data = await api(`/api/empresas/${empresaSlug}/sedes`);
        setSedes(data);
      } catch (error) {
        console.error("Error cargando sedes", error);
      }
    };

    if (empresaSlug) cargarSedes();
  }, [empresaSlug]);

  // ============================
  // CARGAR COLABORADORES
  // ============================

  useEffect(() => {
    const cargarColaboradores = async () => {
      try {
        const data = await api(`/api/usuariosxslug/${empresaSlug}/usuarios`);
        setColaboradores(data);
      } catch (error) {
        console.error("Error cargando colaboradores", error);
      }
    };


    

    if (empresaSlug) cargarColaboradores();
  }, [empresaSlug]);

  // ============================
  // CARGAR SERVICIOS
  // ============================

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const data = await api(`/api/serviciosslug/${empresaSlug}/servicios`);
        setServicios(data);
      } catch (error) {
        console.error("Error cargando servicios", error);
      }
    };

    if (empresaSlug) cargarServicios();
  }, [empresaSlug]);

  // ============================
  // CARGAR USUARIOS (clientes)
  // ============================

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await api(`/api/usuariosxslug/${empresaSlug}/clientes`);
        setUsuarios(data);
      } catch (error) {
        console.error("Error cargando usuarios", error);
      }
    };

    if (empresaSlug) cargarUsuarios();
  }, [empresaSlug]);


  // cargar horarios disponibles

  useEffect(() => {
    if (colaboradorId && sedeId && fechaSeleccionada) {
      generarHorariosDisponibles();
    }
  }, [colaboradorId, sedeId, fechaSeleccionada]);

  // ============================
  // CRUD
  // ============================

  const crearCita = async () => {
    if (!usuarioId || !colaboradorId || !servicioId || !sedeId || !fechaSeleccionada || !horaSeleccionada) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {

      const fechaHoraCompleta = `${fechaSeleccionada}T${horaSeleccionada}:00`;

      const nuevaCita = await api(
        `/api/citasxslug/${empresaSlug}/citas`,
        "POST",
        {
          usuario: usuarioId,
          colaborador: colaboradorId,
          servicio: servicioId,
          sede: sedeId,
          fechaHora: fechaHoraCompleta,
        }
      );

      const citasActualizadas = await api(`/api/citasxslug/${empresaSlug}/citas`);
      setCitas(citasActualizadas);
      cerrarModal();
      alert(nuevaCita.msg || "Cita creada correctamente");
    } catch (error: any) {
      const msg = error?.message || "Error creando cita";
      alert(msg);
    }
  };

  const editarCita = async () => {
    if (!citaSeleccionada) return;

    try {

      const fechaHoraCompleta = `${fechaSeleccionada}T${horaSeleccionada}:00`;

      const citaActualizada = await api(
        `/api/citasxslug/${empresaSlug}/citas/${citaSeleccionada._id}`,
        "PUT",
        {
          usuario: usuarioId,
          colaborador: colaboradorId,
          servicio: servicioId,
          sede: sedeId,
          fechaHora: fechaHoraCompleta,
        }
      );
      
      const citasActualizadas = await api(`/api/citasxslug/${empresaSlug}/citas`);
      setCitas(citasActualizadas);

      cerrarModal();
      alert(citaActualizada.msg || "Cita actualizada correctamente");
    } catch (error: any) {
      const msg = error?.message || "Error editando cita";
      alert(msg);
    }
  };

  const eliminarCita = async () => {
    if (!citaSeleccionada) return;

    try {
      await api(
        `/api/citasxslug/${empresaSlug}/citas/${citaSeleccionada._id}`,
        "DELETE"
      );

      setCitas((prev) => prev.filter((c) => c._id !== citaSeleccionada._id));

      cerrarModal();
      alert("Cita eliminada correctamente");
    } catch (error: any) {
      const msg = error?.message || "Error eliminando cita";
      alert(msg);
    }
  };

  // ============================
  // UTILIDADES
  // ============================

  const cerrarModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setCitaSeleccionada(null);
    setUsuarioId("");
    setColaboradorId("");
    setServicioId("");
    setSedeId("");
    setFechaHora("");
    setEstado("confirmada");
    setFechaSeleccionada("");
    setHoraSeleccionada("");
    setHorariosDisponibles([]);
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
  
  
  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatearFechaInput = (fecha: string) => {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const generarHorariosDisponibles = async () => {
    if (!colaboradorId || !sedeId || !fechaSeleccionada) {
      setHorariosDisponibles([]);
      return;
    }

    try {
    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
    const fecha = new Date(fechaSeleccionada + "T00:00:00");
    const diaSemana = fecha.getDay();

    // Buscar disponibilidad del colaborador para ese día
    const disponibilidad = await api(
      `/api/disponibilidadxslug/${empresaSlug}`
    );


    const horarioDelDia = disponibilidad.find(
      (d: any) =>
        d.colaborador._id === colaboradorId &&
        d.sede._id === sedeId &&
        d.diaSemana === diaSemana &&
        d.activo
    );

    if (!horarioDelDia) {
      setHorariosDisponibles([]);
      alert("El colaborador no tiene disponibilidad para este día");
      return;
    }

    const horarios: string[] = [];
    const [horaInicio, minInicio] = horarioDelDia.horaInicio.split(":");
    const [horaFin, minFin] = horarioDelDia.horaFin.split(":");

    let horaActual = parseInt(horaInicio);
    let minActual = parseInt(minInicio);

    const horaFinNum = parseInt(horaFin);
    const minFinNum = parseInt(minFin);

    while (
      horaActual < horaFinNum ||
      (horaActual === horaFinNum && minActual < minFinNum)
    ) {
      const horaStr = String(horaActual).padStart(2, "0");
      const minStr = String(minActual).padStart(2, "0");
      horarios.push(`${horaStr}:${minStr}`);

      minActual += 30;
      if (minActual >= 60) {
        minActual = 0;
        horaActual++;
      }
    }
    
    const ahora = new Date();
    const esHoy =
      fecha.toDateString() === ahora.toDateString();

    const horariosFiltrados = esHoy
      ? horarios.filter((hora) => {
          const [h, m] = hora.split(":");
          const horaCompleta = new Date(fechaSeleccionada);
          horaCompleta.setHours(parseInt(h), parseInt(m), 0, 0);
          return horaCompleta > ahora;
        })
      : horarios;
      
      setHorariosDisponibles(horariosFiltrados);
    } catch (error) {
      console.error("Error generando horarios:", error);
      setHorariosDisponibles([]);
    }};




  if (loading) {
    return <p className="p-6 text-gray-500">Cargando citas...</p>;
  }

  // ============================
  // UI
  // ============================

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Citas</h1>

        <button
          onClick={() => {
            setModalMode("crear");
            setOpenModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Crear cita
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        {citas.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay citas registradas</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="py-3">Cliente</th>
                <th>Colaborador</th>
                <th>Servicio</th>
                <th>Sede</th>
                <th>Fecha</th>
                <th>Hora inicio</th>
                <th>Hora fin</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {citas.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{c.usuario?.nombre}</td>
                  <td className="text-sm text-gray-600">
                    {c.colaborador?.nombre}
                  </td>
                  <td className="text-sm">{c.servicio?.nombre}</td>
                  <td className="text-sm text-gray-600">{c.sede?.nombre}</td>
                  <td className="text-sm">{formatearFecha(c.fechaHora)}</td>
                  <td className="text-sm">{formatearHora(c.fechaHora)}</td>
                  <td className="text-sm">{formatearHora(c.fechaFin)}</td>
                  <td className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        c.estado === "confirmada"
                          ? "bg-green-100 text-green-700"
                          : c.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : c.estado === "cancelada"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="text-center space-x-4">
                    <button
                      onClick={() => {
                        setCitaSeleccionada(c);
                        setUsuarioId(c.usuario._id);
                        setColaboradorId(c.colaborador._id);
                        setServicioId(c.servicio._id);
                        setSedeId(c.sede._id);

                        const fechaOriginal = new Date(c.fechaHora);
                        const year = fechaOriginal.getFullYear();
                        const month = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
                        const day = String(fechaOriginal.getDate()).padStart(2, "0");
                        const hours = String(fechaOriginal.getHours()).padStart(2, "0");
                        const minutes = String(fechaOriginal.getMinutes()).padStart(2, "0");

                        setFechaSeleccionada(`${year}-${month}-${day}`);
                        setHoraSeleccionada(`${hours}:${minutes}`);
                        setEstado(c.estado);
                        setModalMode("editar");
                        setOpenModal(true);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setCitaSeleccionada(c);
                        setModalMode("eliminar");
                        setOpenModal(true);
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === "crear" && "Crear cita"}
              {modalMode === "editar" && "Editar cita"}
              {modalMode === "eliminar" && "Eliminar cita"}
            </h2>

            {(modalMode === "crear" || modalMode === "editar") && (
              <>
                <select
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                >
                  <option value="">Seleccionar cliente</option>
                  {usuarios.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                >
                  <option value="">Seleccionar colaborador</option>
                  {colaboradores.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                >
                  <option value="">Seleccionar servicio</option>
                  {servicios.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.nombre} ({s.duracion} min - ${s.precio})
                    </option>
                  ))}
                </select>

                <select
                  value={sedeId}
                  onChange={(e) => setSedeId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  min={obtenerFechaMinima()}
                  className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                
                {fechaSeleccionada && colaboradorId && sedeId && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar hora
                    </label>
                  
                  {horariosDisponibles.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No hay horarios disponibles para este día
                    </p>
                  ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                  {horariosDisponibles.map((hora) => (
                    <button
                    key={hora}
                    type="button"
                    onClick={() => setHoraSeleccionada(hora)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      horaSeleccionada === hora
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    >
                    {hora}
                    </button>
                  ))}
                </div>
              )}
              
              {horaSeleccionada && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  Hora seleccionada: {horaSeleccionada}
                </p>
              )}
              </div>
            )}
              </>
            )}

            {modalMode === "eliminar" && (
              <p className="text-gray-600 mb-6">
                ¿Eliminar la cita de{" "}
                <strong>{citaSeleccionada?.usuario?.nombre}</strong> con{" "}
                <strong>{citaSeleccionada?.colaborador?.nombre}</strong>?
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={cerrarModal} className="px-4 py-2">
                Cancelar
              </button>

              {modalMode === "crear" && (
                <button
                  onClick={crearCita}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              )}

              {modalMode === "editar" && (
                <button
                  onClick={editarCita}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar cambios
                </button>
              )}

              {modalMode === "eliminar" && (
                <button
                  onClick={eliminarCita}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}