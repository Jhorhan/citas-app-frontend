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
 * Tipado de disponibilidad/horario
 */
interface Disponibilidad {
  _id: string;
  sede: Sede;
  colaborador: Colaborador;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

const diasSemana = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function AdminHorariosPage() {
  const { empresaSlug } = useParams();

  // ============================
  // ESTADOS
  // ============================

  const [horarios, setHorarios] = useState<Disponibilidad[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"crear" | "editar" | "eliminar" | null>(null);

  const [horarioSeleccionado, setHorarioSeleccionado] = useState<Disponibilidad | null>(null);

  // Formulario
  const [colaboradorId, setColaboradorId] = useState("");
  const [sedeId, setSedeId] = useState("");
  const [diaSemana, setDiaSemana] = useState<number>(1);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [activo, setActivo] = useState(true);

  // ============================
  // CARGAR HORARIOS
  // ============================

  useEffect(() => {
    const cargarHorarios = async () => {
      try {
        const data = await api(`/api/disponibilidadxslug/${empresaSlug}`);
        setHorarios(data);
      } catch (error) {
        console.error("Error cargando horarios", error);
      } finally {
        setLoading(false);
      }
    };

    if (empresaSlug) cargarHorarios();
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
  // CRUD
  // ============================

  const crearHorario = async () => {
    if (!colaboradorId || !sedeId || !horaInicio || !horaFin) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const nuevoHorario = await api(
        `/api/disponibilidadxslug/${empresaSlug}`,
        "POST",
        {
          colaborador: colaboradorId,
          sede: sedeId,
          diaSemana,
          horaInicio,
          horaFin,
          activo,
        }
      );

      setHorarios((prev) => [...prev, nuevoHorario]);
      cerrarModal();
    } catch (error: any) {
      const msg = error?.message || "Error creando horario";
      alert(msg);
    }
  };

  const editarHorario = async () => {
    if (!horarioSeleccionado) return;

    try {
      const horarioActualizado = await api(
        `/api/disponibilidadxslug/${empresaSlug}/${horarioSeleccionado._id}`,
        "PUT",
        {
          colaborador: colaboradorId,
          sede: sedeId,
          diaSemana,
          horaInicio,
          horaFin,
          activo,
        }
      );

      setHorarios((prev) =>
        prev.map((h) =>
          h._id === horarioSeleccionado._id ? horarioActualizado : h
        )
      );

      cerrarModal();
    } catch (error) {
      console.error("Error editando horario", error);
    }
  };

  const eliminarHorario = async () => {
  if (!horarioSeleccionado) return;

  try {
    await api(
      `/api/disponibilidadxslug/${empresaSlug}/${horarioSeleccionado._id}`,
      "DELETE"
    );

    setHorarios((prev) =>
      prev.filter((h) => h._id !== horarioSeleccionado._id)
    );

    cerrarModal();
  } catch (error) {
    console.error("Error eliminando horario", error);
  }
};


  // ============================
  // UTILIDADES
  // ============================

  const cerrarModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setHorarioSeleccionado(null);
    setColaboradorId("");
    setSedeId("");
    setDiaSemana(1);
    setHoraInicio("");
    setHoraFin("");
    setActivo(true);
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Cargando horarios...</p>;
  }

  // ============================
  // UI
  // ============================

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Horarios de Disponibilidad
        </h1>

        <button
          onClick={() => {
            setModalMode("crear");
            setOpenModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Crear horario
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        {horarios.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay horarios registrados</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="py-3">Colaborador</th>
                <th>Sede</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {horarios.map((h) => (
                <tr key={h._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{h.colaborador?.nombre}</td>
                  <td className="text-sm text-gray-600">{h.sede?.nombre}</td>
                  <td className="text-sm">{diasSemana[h.diaSemana]}</td>
                  <td className="text-sm">
                    {h.horaInicio} - {h.horaFin}
                  </td>
                  <td className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        h.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {h.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="text-center space-x-4">
                    <button
                      onClick={() => {
                        setHorarioSeleccionado(h);
                        setColaboradorId(h.colaborador._id);
                        setSedeId(h.sede._id);
                        setDiaSemana(h.diaSemana);
                        setHoraInicio(h.horaInicio);
                        setHoraFin(h.horaFin);
                        setActivo(h.activo);
                        setModalMode("editar");
                        setOpenModal(true);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setHorarioSeleccionado(h);
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
              {modalMode === "crear" && "Crear horario"}
              {modalMode === "editar" && "Editar horario"}
              {modalMode === "eliminar" && "Eliminar horario"}
            </h2>

            {(modalMode === "crear" || modalMode === "editar") && (
              <>
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

                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                >
                  {diasSemana.map((dia, index) => (
                    <option key={index} value={index}>
                      {dia}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="time"
                    placeholder="Hora inicio"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <input
                    type="time"
                    placeholder="Hora fin"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="mr-2"
                    id="activo"
                  />
                  <label htmlFor="activo" className="text-sm">
                    Horario activo
                  </label>
                </div>
              </>
            )}

            {modalMode === "eliminar" && (
              <p className="text-gray-600 mb-6">
                ¿Eliminar el horario de{" "}
                <strong>{horarioSeleccionado?.colaborador?.nombre}</strong>?
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={cerrarModal}>Cancelar</button>

              {modalMode === "crear" && (
                <button
                  onClick={crearHorario}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              )}

              {modalMode === "editar" && (
                <button
                  onClick={editarHorario}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Guardar cambios
                </button>
              )}

              {modalMode === "eliminar" && (
                <button
                  onClick={eliminarHorario}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
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