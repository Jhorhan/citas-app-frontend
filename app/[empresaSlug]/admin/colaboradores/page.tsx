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
 * Tipado de usuario / colaborador
 */
interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: "admin" | "colaborador";
  sede?: {
    _id: string;
    nombre: string;
  };
}

export default function AdminColaboradoresPage() {
  const { empresaSlug } = useParams();

  // ============================
  // ESTADOS
  // ============================

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] =
    useState<"crear" | "editar" | "eliminar" | null>(null);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sede, setSede] = useState("");

  // ============================
  // CARGAR COLABORADORES
  // ============================

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await api(
          `/api/usuariosxslug/${empresaSlug}/usuarios`
        );
        setUsuarios(data);
      } catch (error) {
        console.error("Error cargando colaboradores", error);
      } finally {
        setLoading(false);
      }
    };

    if (empresaSlug) cargarUsuarios();
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
  // CRUD
  // ============================

  const crearColaborador = async () => {
    if (!nombre || !email || !password || !sede) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const resp = await api(
        `/api/usuariosxslug/${empresaSlug}/usuarios`,
        "POST",
        { nombre, email, password, sede }
      );
      
      const sedeCompleta = sedes.find((s) => s._id === sede);
      setUsuarios((prev) => [
        ...prev,
        {
          ...resp.usuario,
          sede: sedeCompleta || undefined,
        },
      ]);
      cerrarModal();
    } catch (error: any) {
      const msg =
      error?.message ||
      error?.response?.data?.msg ||
      "Error creando colaborador";
      alert(msg);
    }
  };


  const editarColaborador = async () => {
    if (!usuarioSeleccionado) return;

    try {
      await api(
        `/api/usuariosxslug/${empresaSlug}/usuarios/${usuarioSeleccionado._id}`,
        "PUT",
        { nombre, email, sede }
      );

      setUsuarios((prev) =>
        prev.map((u) =>
          u._id === usuarioSeleccionado._id
            ? {
                ...u,
                nombre,
                email,
                sede: sedes.find((s) => s._id === sede),
              }
            : u
        )
      );

      cerrarModal();
    } catch (error) {
      console.error("Error editando colaborador", error);
    }
  };

  const eliminarColaborador = async () => {
    if (!usuarioSeleccionado) return;

    try {
      await api(
        `/api/usuariosxslug/${empresaSlug}/usuarios/${usuarioSeleccionado._id}`,
        "DELETE"
      );

      setUsuarios((prev) =>
        prev.filter((u) => u._id !== usuarioSeleccionado._id)
      );

      cerrarModal();
    } catch (error) {
      console.error("Error eliminando colaborador", error);
    }
  };

  // ============================
  // UTILIDADES
  // ============================

  const cerrarModal = () => {
    setOpenModal(false);
    setModalMode(null);
    setUsuarioSeleccionado(null);
    setNombre("");
    setEmail("");
    setPassword("");
    setSede("");
  };

  if (loading) {
    return (
      <p className="p-6 text-gray-500">
        Cargando colaboradores...
      </p>
    );
  }

  // ============================
  // UI
  // ============================

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Colaboradores
        </h1>

        <button
          onClick={() => {
            setModalMode("crear");
            setOpenModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Crear colaborador
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        {usuarios.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay colaboradores registrados
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600 text-sm">
                <th className="py-3">Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Sede</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 font-medium">
                    {u.nombre}
                  </td>
                  <td className="text-sm text-gray-600">
                    {u.email}
                  </td>
                  <td className="text-sm">{u.rol}</td>
                  <td className="text-sm">
                    {u.sede?.nombre || "-"}
                  </td>
                  <td className="text-center space-x-4">
                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(u);
                        setNombre(u.nombre);
                        setEmail(u.email);
                        setSede(u.sede?._id || "");
                        setModalMode("editar");
                        setOpenModal(true);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        setUsuarioSeleccionado(u);
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
              {modalMode === "crear" && "Crear colaborador"}
              {modalMode === "editar" && "Editar colaborador"}
              {modalMode === "eliminar" && "Eliminar colaborador"}
            </h2>

            {(modalMode === "crear" || modalMode === "editar") && (
              <>
                <input
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />

                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />

                <select
                  value={sede}
                  onChange={(e) => setSede(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>

                {modalMode === "crear" && (
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 mb-3"
                  />
                )}
              </>
            )}

            {modalMode === "eliminar" && (
              <p className="text-gray-600 mb-6">
                ¿Eliminar a{" "}
                <strong>
                  {usuarioSeleccionado?.nombre}
                </strong>
                ?
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={cerrarModal}>Cancelar</button>

              {modalMode === "crear" && (
                <button
                  onClick={crearColaborador}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              )}

              {modalMode === "editar" && (
                <button
                  onClick={editarColaborador}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Guardar cambios
                </button>
              )}

              {modalMode === "eliminar" && (
                <button
                  onClick={eliminarColaborador}
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
