"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut, User } from "lucide-react";

interface Usuario {
  nombre: string;
  email: string;
  rol: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      setUsuario(JSON.parse(stored));
    }
  }, []);

  const empresaNombre = empresaSlug
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // LOGOUT
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push(`/${empresaSlug}/login`);
  };

  return (
    <div className="min-h-screen flex bg-white text-gray-800">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative z-40 min-h-screen bg-[#155dfc] text-white
          transition-all duration-300
          ${menuOpen ? "w-56" : "w-14"}
          md:hover:w-56
        `}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        {/* Empresa */}
        <div className="p-4 font-bold truncate">
          {menuOpen && empresaNombre}
        </div>

        {/* MENÚ (RUTAS) */}
        <nav className="space-y-2 px-2">
          <MenuItem
            label="Sedes"
            href={`/${empresaSlug}/admin/sedes`}
            show={menuOpen}
          />
          <MenuItem
            label="Colaboradores"
            href={`/${empresaSlug}/admin/colaboradores`}
            show={menuOpen}
          />
          <MenuItem
            label="Horarios"
            href={`/${empresaSlug}/admin/horarios`}
            show={menuOpen}
          />
          <MenuItem
            label="Servicios"
            href={`/${empresaSlug}/admin/servicios`}
            show={menuOpen}
          />
          <MenuItem
            label="Citas"
            href={`/${empresaSlug}/admin/citas`}
            show={menuOpen}
          />
          <MenuItem
            label="Dashboard e Informes"
            href={`/${empresaSlug}/admin`}
            show={menuOpen}
          />
        </nav>

        {/* USUARIO + LOGOUT */}
        <div className="absolute bottom-4 left-0 w-full px-2">
          <div className="flex items-center gap-3 p-2 rounded hover:bg-white/20 transition">
            <User size={18} />

            {menuOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">
                  {usuario?.nombre || "Usuario"}
                </p>
                <p className="text-xs opacity-80">
                  {usuario?.rol}
                </p>
              </div>
            )}

            {menuOpen && (
              <button onClick={cerrarSesion} title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            )}
          </div>

          {!menuOpen && (
            <div className="flex justify-center mt-2 opacity-60">
              <ChevronRight size={16} />
            </div>
          )}
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6 ml-14 md:ml-0">
        {children}
      </main>
    </div>
  );
}

function MenuItem({
  label,
  href,
  show,
}: {
  label: string;
  href: string;
  show: boolean;
}) {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded hover:bg-white/20 transition"
    >
      {show && label}
    </a>
  );
}
