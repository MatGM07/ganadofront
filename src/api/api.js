export const API_URL = import.meta.env.VITE_API_URL;

async function parseError(res) {
  try {
    const text = await res.text();
    return JSON.parse(text).error || text;
  } catch {
    return "Error desconocido del servidor";
  }
}

export async function apiGet(endpoint) {
  const token = localStorage.getItem("token");

  console.log("=== API GET ===");
  console.log("URL:", API_URL + endpoint);
  console.log("TOKEN:", token);

  const res = await fetch(API_URL + endpoint, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : undefined
    }
  });

  console.log("Response status:", res.status);

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiPost(path, body) {
  const token = localStorage.getItem("token");

  console.log("=== API POST ===");
  console.log("URL:", API_URL + path);
  console.log("TOKEN:", token);
  console.log("BODY ENVIADO:", body);
  console.log("HEADERS:", {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : undefined
  });

  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : undefined
    },
    body: JSON.stringify(body)
  });

  console.log("Response status:", res.status);

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiPut(path, body) {
  const token = localStorage.getItem("token");
  
  const res = await fetch(API_URL + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : undefined
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiDelete(path) {
  const token = localStorage.getItem("token");

  console.log("=== API DELETE ===");
  console.log("URL:", API_URL + path);
  console.log("TOKEN:", token);

  const res = await fetch(API_URL + path, {
    method: "DELETE",
    headers: {
      "Authorization": token ? `Bearer ${token}` : undefined
    }
  });

  console.log("Response status:", res.status);

  if (!res.ok) throw new Error(await parseError(res));
  
  // DELETE puede retornar vacío (204) o JSON
  if (res.status === 204) return null;
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}