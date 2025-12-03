"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

export default function LoginPage() {
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

      // Guardamos token
      Cookies.set("token", res.usuario.token, {
        expires: 7,
        secure: false,
      });

      setMsg("Login correcto");

      // verificar rol
      const rol: string = res.usuario.rol;

      // Mapeo de rutas por rol
      const redirectMap: Record<string, string> = {
        cliente: "/cliente",
        colaborador: "/colaborador",
        admin: "/admin",
        superadmin: "/superadmin", // 👈 aquí está tu rol
      };

      // Redirigir según rol
      window.location.href = redirectMap[rol] || "/login";

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
        />

        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 w-full rounded"
        >
          Entrar
        </button>
      </form>

      {msg && <p className="mt-4">{msg}</p>}
    </main>
  );
}
