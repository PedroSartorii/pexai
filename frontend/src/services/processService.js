import api from "./api";

export async function createProcess(data) {
  const token = localStorage.getItem("token");
  const response = await api.post("/process", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function listProcesses() {
  const token = localStorage.getItem("token");
  const response = await api.get("/process", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function downloadDocx(id) {
  const token = localStorage.getItem("token");
  const response = await api.get(`/process/${id}/docx`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `processo-${id}.docx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}