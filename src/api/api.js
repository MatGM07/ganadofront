export const API_URL = "http://localhost:8080"; // Gateway

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

  const res = await fetch(API_URL + endpoint, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : undefined
    }
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiPost(path, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : undefined
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}