"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

/**
 * Tipado de una sede
 * Me ayuda a tener autocompletado y evitar errores
 */
interface Sede {
  _id: string;
  nombre: string;
  direccion: string;
}

export default function AdminSedesPage() {
  const { empresaSlug } = useParams();

  // ============================
  // ESTADOS PRINCIPALES
  // ============================

  // Lista de sedes
  const [sedes, setSedes] = useState<Sede[]>([]);

  // Loading general de la página
  const [loading, setLoading] = useState(true);

  // Control del modal
  const [openModal, setOpenModal] = useState(false);

  /**
   * Modo del modal:
   * - crear   -> formulario vacío
   * - editar  -> formulario con datos
   * - eliminar-> solo confirmación
   */
  const [modalMode, setModalMode] = useState<
    "crear" | "editar" | "eliminar" | null
  >(null);

  // Sede seleccionada para editar o eliminar
  const [sedeSeleccionada, setSedeSeleccionada] =
    useState<Sede | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

  // ============================
  // CARGAR SEDES
  // ============================

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const data = await api(
          `/api/empresas/${empresaSlug}/sedes`
        );
        setSedes(data);
      } catch (error) {
        console.error("Error cargando sedes", error);
      } finally {
        setLoading(false);
      }
    };

    if (empresaSlug) cargarSedes();
  }, [empresaSlug]);

  // ============================
  // FUNCIONES CRUD
  // ============================

  // Crear sede
  const crearSede = async () => {
    try {
      const nuevaSede = await api(
        `/api/empresas/${empresaSlug}/sedes`,
        "POST",
        { nombre, direccion }
      );

      // Agrego la sede sin volver a cargar todo
      setSedes((prev) => [...prev, nuevaSede]);

      cerrarModal();
    } catch (error) {
      console.error("Error creando sede", error);
    }
  };

  // Editar sede
  const editarSede = async () => {
    if (!sedeSeleccionada) return;

    try {
      await api(
        `/api/empresas/${empresaSlug}/sedes/${sedeSeleccionada._id}`,
        "PUT",
        { nombre, direccion }
      );

      // Actualizo la sede en el estado
      setSedes((prev) =>
        prev.map((sede) =>
          sede._id === sedeSeleccionada._id
            ? { ...sede, nombre, direccion }
            : sede
        )
      );

      cerrarModal();
    } catch (error) {
      console.error("Error editando sede", error);
    }
  };

  // Eliminar sede
  const eliminarSede = async () => {
    if (!sedeSeleccionada) return;

    try {
      await api(
        `/api/empresas/${empresaSlug}/sedes/${sedeSeleccionada._id}`,
        "DELETE"
      );

      // Quito la sede del estado
      setSedes((prev) =>
        prev.filter(
          (sede) => sede._id !== sedeSeleccionada._id
        )
      );

      cerrarModal();
    } catch (error) {
      console.error("Error eliminando sede", error);
    }
  };

  // ============================
  // UTILIDADES
  // ============================

  // Cierra el modal y limpia estados
  const cerrarModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setSedeSeleccionada(null);
    setNombre("");
    setDireccion("");
  };

  if (loading) {
    return (
      <p className="p-6 text-gray-500">
        Cargando sedes...
      </p>
    );
  }

  // ============================
  // UI
  // ============================

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Sedes
        </h1>

        <button
          onClick={() => {
            setModalMode("crear");
            setOpenModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Crear sede
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border p-4">
        {sedes.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay sedes registradas
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="py-3">Nombre</th>
                <th>Dirección</th>
                <th className="text-center">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {sedes.map((sede) => (
                <tr
                  key={sede._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 font-medium">
                    {sede.nombre}
                  </td>
                  <td className="text-sm text-gray-600">
                    {sede.direccion}
                  </td>
                  <td className="text-center space-x-4">
                    <button
                      onClick={() => {
                        setSedeSeleccionada(sede);
                        setNombre(sede.nombre);
                        setDireccion(sede.direccion);
                        setModalMode("editar");
                        setOpenModal(true);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setSedeSeleccionada(sede);
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

      {/* ============================
          MODAL ÚNICO
      ============================ */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === "crear" &&
                "Crear nueva sede"}
              {modalMode === "editar" &&
                "Editar sede"}
              {modalMode === "eliminar" &&
                "Eliminar sede"}
            </h2>

            {/* Formulario */}
            {(modalMode === "crear" ||
              modalMode === "editar") && (
              <>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />

                <input
                  type="text"
                  placeholder="Dirección"
                  value={direccion}
                  onChange={(e) =>
                    setDireccion(e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 mb-4"
                />
              </>
            )}

            {/* Confirmación eliminar */}
            {modalMode === "eliminar" && (
              <p className="text-gray-600 mb-6">
                ¿Seguro que deseas eliminar la sede{" "}
                <strong>
                  {sedeSeleccionada?.nombre}
                </strong>
                ? Esta acción no se puede deshacer.
              </p>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>

              {modalMode === "crear" && (
                <button
                  onClick={crearSede}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              )}

              {modalMode === "editar" && (
                <button
                  onClick={editarSede}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Guardar cambios
                </button>
              )}

              {modalMode === "eliminar" && (
                <button
                  onClick={eliminarSede}
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
