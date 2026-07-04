import api from './api';

export const getNotifikasi = () => {
  return api.get('/notifikasi');
};

export const markAsRead = (id) => {
  return api.put(`/notifikasi/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put('/notifikasi/read-all');
};
