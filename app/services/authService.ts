export const loginWithGoogle = async (credential: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Necesario para recibir cookie HttpOnly
        body: JSON.stringify({ credential }),
      }
    );

    // Manejo de errores HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || "Error al iniciar sesión con Google");
    }

    const data = await response.json();

    if (!data.usuario) {
      throw new Error("Respuesta del servidor inválida: falta usuario");
    }

    return data;
  } catch (error) {
    console.error("Error en login con Google:", error);
    throw error;
  }
};
