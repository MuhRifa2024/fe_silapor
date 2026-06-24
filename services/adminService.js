import api from "./api";

export const getAdminDashboardStats = async () => {
  const response = await api.get("/dashboard/admin");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const createUserByAdmin = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// KATEGORI SERVICES
export const createKategori = async (data) => {
  const response = await api.post("/kategori", data);
  return response.data;
};

export const updateKategori = async (id, data) => {
  const response = await api.put(`/kategori/${id}`, data);
  return response.data;
};
