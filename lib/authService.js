export async function loginConGoogleBackend(credential, slug) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`, {
      method: "POST",
      credentials: "include", // IMPORTANTÍSIMO para cookies
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        credential,
        slug
      })
    });

    const data = await response.json();
    return { ok: response.ok, data };
  } catch (error) {
    console.error("Error login Google frontend:", error);
    return { ok: false, data: { msg: "Error de conexión con el servidor" } };
  }
}
