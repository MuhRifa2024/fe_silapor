import api from './api';

const triggerNotifRefresh = () => {
  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.dispatchEvent(new Event("silapor-notif-refresh"));
    }, 400);
  }
};

export const getLaporanList = async (params = {}) => {
  const response = await api.get('/laporan', { params });
  return response.data;
};

export const getLaporanDetail = async (id) => {
  const response = await api.get(`/laporan/${id}`);
  return response.data;
};

export const createLaporan = async (laporanData) => {
  const response = await api.post('/laporan', laporanData);
  triggerNotifRefresh();
  return response.data;
};

export const updateStatusLaporan = async (id, statusData) => {
  const response = await api.put(`/laporan/${id}/status`, statusData);
  triggerNotifRefresh();
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

export const submitRating = async (id, ratingData) => {
  const response = await api.put(`/laporan/${id}/rating`, ratingData);
  triggerNotifRefresh();
  return response.data;
};

export const adminUpdateLaporan = async (id, updateData) => {
  const response = await api.put(`/laporan/${id}/admin-update`, updateData);
  triggerNotifRefresh();
  return response.data;
};
