import api from './api';

export const getLaporanList = async () => {
  const response = await api.get('/laporan');
  return response.data;
};

export const getLaporanDetail = async (id) => {
  const response = await api.get(`/laporan/${id}`);
  return response.data;
};

export const createLaporan = async (laporanData) => {
  const response = await api.post('/laporan', laporanData);
  return response.data;
};

export const updateStatusLaporan = async (id, statusData) => {
  const response = await api.put(`/laporan/${id}/status`, statusData);
  return response.data;
};

export const deleteLaporan = async (id) => {
  const response = await api.delete(`/laporan/${id}`);
  return response.data;
};

export const getLaporanRiwayat = async (id) => {
  const response = await api.get(`/laporan/${id}/riwayat`);
  return response.data;
};
