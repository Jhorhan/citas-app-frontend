import Cookies from "js-cookie";

const API_URL = "http://localhost:4000";

export async function api(
  endpoint: string,
  method: string = "GET",
  data?: any
) {
  const token = Cookies.get("token");
  console.log("Token en cookie:", token); // 👈 solo para depurar

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || `Error ${res.status}`);
  }

  return res.json();
}
