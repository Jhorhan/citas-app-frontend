"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function AdminDashboardPage() {
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const [menuOpen, setMenuOpen] = useState(false);

  const empresaNombre = empresaSlug
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen flex bg-[#ffffff] text-gray-800">

      {/* CONTENIDO */}
      <main className="flex-1 p-6 space-y-8 ml-14 md:ml-0">
        {/* HEADER */}
        <header>
          <h1 className="text-3xl font-bold text-[#155dfc]">
            Panel administrativo
          </h1>
          <p className="text-gray-500">
            Gestión general de {empresaNombre}
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi title="Citas pendientes" value="12" />
          <Kpi title="Citas atendidas" value="180" />
          <Kpi title="Citas canceladas" value="8" />
          <Kpi title="Colaboradores activos" value="5" />
        </section>

        {/* FILTROS */}
        <section className="bg-[#abb2c5]/20 p-4 rounded-lg flex flex-wrap gap-4 items-end">
          <Filter label="Fecha inicial" type="date" />
          <Filter label="Fecha final" type="date" />
          <button className="bg-[#155dfc] text-white px-6 py-2 rounded hover:opacity-90">
            Aplicar filtros
          </button>
        </section>

        {/* GRAFICAS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartBox title="Citas por sede" />
          <ChartBox title="Citas por colaborador" />
          <ChartBox title="Citas por servicio" />
        </section>

        {/* EXPORTAR */}
        <div className="flex justify-center md:justify-end">
          <button className="bg-[#155dfc] text-white px-6 py-2 rounded hover:opacity-90">
            Exportar informe
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTES ---------------- */

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

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-[#155dfc]">{value}</p>
    </div>
  );
}

function Filter({ label, type }: { label: string; type: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600">{label}</label>
      {type === "select" ? (
        <select className="border p-2 rounded">
          <option>Todas</option>
        </select>
      ) : (
        <input type={type} className="border p-2 rounded" />
      )}
    </div>
  );
}

function ChartBox({ title }: { title: string }) {
  return (
    <div className="border rounded-lg p-4 h-64 flex flex-col">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex-1 bg-[#abb2c5]/30 rounded flex items-center justify-center text-gray-500">
        Gráfica aquí
      </div>
    </div>
  );
}
