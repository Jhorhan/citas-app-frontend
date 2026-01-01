"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

interface Sede {
  _id: string;
  nombre: string;
  direccion: string;
}

export default function AdminSedesPage() {
  const { empresaSlug } = useParams();

  // Estado donde guardo las sedes
  const [sedes, setSedes] = useState<Sede[]>([]);

  // Loading general de la página
  const [loading, setLoading] = useState(true);

  // 🔥 Estado para controlar el pop-up (modal)
  const [openModal, setOpenModal] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

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

  // 🧠 Función para crear una sede
  const crearSede = async () => {
    try {
      await api(`/api/empresas/${empresaSlug}/sedes`, 
        "POST",
        {
          nombre,
          direccion,
        },
      );

      // Cierro el modal
      setOpenModal(false);

      // Limpio el formulario
      setNombre("");
      setDireccion("");

      // Recargo las sedes
      const data = await api(
        `/api/empresas/${empresaSlug}/sedes`
      );
      setSedes(data);
    } catch (error) {
      console.error("Error creando sede", error);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Cargando sedes...</p>;
  }

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sedes</h1>

        {/* 🔥 Abre el modal */}
        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Crear sede
        </button>
      </div>

      {/* Card */}
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
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {sedes.map((sede) => (
                <tr
                  key={sede._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 font-medium">
                    {sede.nombre}
                  </td>
                  <td className="text-sm text-gray-600">
                    {sede.direccion}
                  </td>
                  <td className="text-center space-x-5">
                    <button className="text-blue-600 hover:underline text-sm">
                      Editar
                    </button>
                    <button className="text-red-600 hover:underline text-sm">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔥 MODAL CREAR SEDE */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          {/* Caja del modal */}
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Crear nueva sede
            </h2>

            {/* Input nombre */}
            <input
              type="text"
              placeholder="Nombre de la sede"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            {/* Input dirección */}
            <input
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            {/* Acciones */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>

              <button
                onClick={crearSede}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
