"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const [menuOpen, setMenuOpen] = useState(false);

  const empresaNombre = empresaSlug
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen flex bg-white text-gray-800">
      {/* MENU */}
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
        <div className="p-4 font-bold truncate">
          {menuOpen && empresaNombre}
        </div>

        <nav className="space-y-2 px-2">
          <MenuItem label="Dashboard" href="admin" show={menuOpen} />
          <MenuItem label="Sedes" href="admin/sedes" show={menuOpen} />
          <MenuItem label="Horarios" href="admin/horarios" show={menuOpen} />
          <MenuItem label="Servicios" href="admin/servicios" show={menuOpen} />
          <MenuItem label="Citas" href="admin/citas" show={menuOpen} />
          <MenuItem label="Colaboradores" href="admin/colaboradores" show={menuOpen} />
        </nav>
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
