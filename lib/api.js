const API_URL = "http://localhost:4000";

export async function api(endpoint, method = "GET", data) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);

  if (!res.ok) {
    throw new Error(`Error en la petición: ${res.status}`);
  }

  return res.json();
}
