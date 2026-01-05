"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

interface Sede {
  _id: string;
  nombre: string;
}

interface Servicio {
  _id: string;
  nombre: string;
  descripcion?: string;
  duracion: number;
  precio: number;
  disponible: boolean;
  aplicaATodasLasSedes: boolean;
  sedes: Sede[];
}

export default function AdminServiciosPage() {
  const { empresaSlug } = useParams();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] =
    useState<"crear" | "editar" | "eliminar" | null>(null);

  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<Servicio | null>(null);

  // Form
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [aplicaATodas, setAplicaATodas] = useState(true);
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState<string[]>([]);

  // ============================
  // DATA
  // ============================

  useEffect(() => {
    if (!empresaSlug) return;

    api(`/api/serviciosslug/${empresaSlug}/servicios`)
      .then(setServicios)
      .finally(() => setLoading(false));

    api(`/api/empresas/${empresaSlug}/sedes`).then(setSedes);
  }, [empresaSlug]);

  // ============================
  // CRUD
  // ============================

  const crearServicio = async () => {
    if (!nombre || !duracion || !precio) {
      alert("Todos los campos obligatorios");
      return;
    }

    if (!aplicaATodas && sedesSeleccionadas.length === 0) {
      alert("Selecciona al menos una sede");
      return;
    }

    const resp = await api(
      `/api/serviciosslug/${empresaSlug}/servicios`,
      "POST",
      {
        nombre,
        descripcion,
        duracion: Number(duracion),
        precio: Number(precio),
        disponible,
        aplicaATodasLasSedes: aplicaATodas,
        sedes: sedesSeleccionadas,
      }
    );

    setServicios((prev) => [resp, ...prev]);
    cerrarModal();
  };

  const editarServicio = async () => {
    if (!servicioSeleccionado) return;

    const resp = await api(
      `/api/serviciosslug/${empresaSlug}/servicios/${servicioSeleccionado._id}`,
      "PUT",
      {
        nombre,
        descripcion,
        duracion: Number(duracion),
        precio: Number(precio),
        disponible,
        aplicaATodasLasSedes: aplicaATodas,
        sedes: sedesSeleccionadas,
      }
    );

    setServicios((prev) =>
      prev.map((s) => (s._id === resp._id ? resp : s))
    );

    cerrarModal();
  };

  const eliminarServicio = async () => {
    if (!servicioSeleccionado) return;

    await api(
      `/api/serviciosslug/${empresaSlug}/servicios/${servicioSeleccionado._id}`,
      "DELETE"
    );

    setServicios((prev) =>
      prev.filter((s) => s._id !== servicioSeleccionado._id)
    );

    cerrarModal();
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setServicioSeleccionado(null);
    setNombre("");
    setDescripcion("");
    setDuracion("");
    setPrecio("");
    setDisponible(true);
    setAplicaATodas(true);
    setSedesSeleccionadas([]);
  };

  if (loading) return <p className="p-6">Cargando servicios...</p>;

  // ============================
  // UI
  // ============================

  return (
    <main className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <button
          onClick={() => {
            setModalMode("crear");
            setOpenModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Crear servicio
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        {servicios.length === 0 ? (
          <p className="text-gray-500">No hay servicios registrados</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-600">
                <th>Nombre</th>
                <th>Duración</th>
                <th>Precio</th>
                <th>Sedes</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="py-2 font-medium">{s.nombre}</td>
                  <td>{s.duracion} min</td>
                  <td>${s.precio}</td>
                  <td>
                    {s.aplicaATodasLasSedes
                      ? "Todas"
                      : s.sedes.map((x) => x.nombre).join(", ")}
                  </td>
                  <td>{s.disponible ? "Activo" : "Inactivo"}</td>
                  <td className="text-center space-x-4">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        setServicioSeleccionado(s);
                        setNombre(s.nombre);
                        setDescripcion(s.descripcion || "");
                        setDuracion(String(s.duracion));
                        setPrecio(String(s.precio));
                        setDisponible(s.disponible);
                        setAplicaATodas(s.aplicaATodasLasSedes);
                        setSedesSeleccionadas(s.sedes.map((x) => x._id));
                        setModalMode("editar");
                        setOpenModal(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => {
                        setServicioSeleccionado(s);
                        setModalMode("eliminar");
                        setOpenModal(true);
                      }}
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === "crear" && "Crear servicio"}
              {modalMode === "editar" && "Editar servicio"}
              {modalMode === "eliminar" && "Eliminar servicio"}
            </h2>

            {(modalMode === "crear" || modalMode === "editar") && (
              <>
                <label className="text-sm">Nombre</label>
                <input
                  className="w-full border rounded px-3 py-2 mb-3"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />

                <label className="text-sm">Descripción</label>
                <textarea
                  className="w-full border rounded px-3 py-2 mb-3"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />

                <label className="text-sm">Duración (minutos)</label>
                <input
                  inputMode="numeric"
                  className="w-full border rounded px-3 py-2 mb-3"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                />

                <label className="text-sm">Precio (COP)</label>
                <input
                  inputMode="numeric"
                  className="w-full border rounded px-3 py-2 mb-3"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />

                <label className="flex gap-2 text-sm mb-3">
                  <input
                    type="checkbox"
                    checked={aplicaATodas}
                    onChange={(e) => setAplicaATodas(e.target.checked)}
                  />
                  Aplicar a todas las sedes
                </label>

                {!aplicaATodas && (
                  <select
                    multiple
                    className="w-full border rounded px-3 py-2 mb-3"
                    value={sedesSeleccionadas}
                    onChange={(e) =>
                      setSedesSeleccionadas(
                        Array.from(e.target.selectedOptions, (o) => o.value)
                      )
                    }
                  >
                    {sedes.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                )}

                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={disponible}
                    onChange={(e) => setDisponible(e.target.checked)}
                  />
                  Servicio disponible
                </label>
              </>
            )}

            {modalMode === "eliminar" && (
              <p>
                ¿Eliminar <strong>{servicioSeleccionado?.nombre}</strong>?
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal}>Cancelar</button>

              {modalMode === "crear" && (
                <button
                  onClick={crearServicio}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              )}

              {modalMode === "editar" && (
                <button
                  onClick={editarServicio}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar cambios
                </button>
              )}

              {modalMode === "eliminar" && (
                <button
                  onClick={eliminarServicio}
                  className="bg-red-600 text-white px-4 py-2 rounded"
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
