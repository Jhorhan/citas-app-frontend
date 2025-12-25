"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const { empresaSlug } = useParams<{ empresaSlug: string }>();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("Registrando...");

    if (!empresaSlug) {
      setMsg("Empresa no válida");
      return;
    }

    try {
      await api("/api/usuarios/register", "POST", {
        nombre,
        email,
        password,
        empresaSlug, 
      });

      // 1️⃣ Limpia formulario
      setNombre("");
      setEmail("");
      setPassword("");

      // 2️⃣ Mensaje
      setMsg("Registro exitoso. Redirigiendo al login...");

      // 3️⃣ Redirigir al login del mismo comercio
      setTimeout(() => {
        router.push(
          `/${empresaSlug}/login?email=${encodeURIComponent(email)}`
        );
      }, 1000);

    } catch (err: any) {
      setMsg(err.message || "Error al registrarse");
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-2">Crear cuenta</h1>

      {/* Nombre del comercio visible */}
      <p className="text-sm text-gray-500 mb-4">
        Comercio: <strong>{empresaSlug}</strong>
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          className="border p-2 w-full"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Correo"
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 w-full rounded"
        >
          Registrarme
        </button>
      </form>

      {msg && <p className="mt-4 text-center">{msg}</p>}
    </main>
  );
}
