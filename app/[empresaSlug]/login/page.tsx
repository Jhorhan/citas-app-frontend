"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

export default function LoginPage() {
  const params = useParams();
  const empresaSlug = params?.empresaSlug as string | undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setMsg("Cargando...");

  try {
    const res = await api("/api/usuarios/login", "POST", {
      email,
      password,
    });


    // 🔐 Guardar token
    const token = res.usuario?.token;

    if (!token) {
      setMsg("No se recibió token del servidor");
      return;
    }

    Cookies.set("token", token);

    const rol: string = res.usuario.rol;

    if (rol === "superadmin") {
      window.location.href = "/superadmin";
      return;
    }

    if (!empresaSlug) {
      setMsg("Error: empresa no identificada");
      return;
    }

    const redirectMap: Record<string, string> = {
      cliente: `/${empresaSlug}/cliente`,
      colaborador: `/${empresaSlug}/colaborador`,
      admin: `/${empresaSlug}/admin`,
    };

    window.location.href =
      redirectMap[rol] || `/${empresaSlug}/login`;
  } catch (err: unknown) {
    if (err instanceof Error) {
      setMsg("Error: " + err.message);
    } else {
      setMsg("Error desconocido");
    }
  }
}



  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Iniciar sesión</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          className="border p-2 w-full"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 w-full rounded"
        >
          Entrar
        </button>
      </form>

      {/* 
        El registro SOLO aplica para empresas,
        el superadmin no se registra desde aquí
      */}
      {empresaSlug && (
        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <a
            href={`/${empresaSlug}/register`}
            className="text-blue-600 underline"
          >
            Regístrate aquí
          </a>
        </p>
      )}

      {msg && <p className="mt-4">{msg}</p>}
    </main>
  );
}
