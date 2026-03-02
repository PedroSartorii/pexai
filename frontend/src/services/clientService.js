import api from "./api";

export async function createClient(data) {
  const token = localStorage.getItem("token");
  const response = await api.post("/clients", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function listClients() {
  const token = localStorage.getItem("token");
  const response = await api.get("/clients", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
