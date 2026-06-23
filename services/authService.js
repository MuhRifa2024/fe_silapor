import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/changepassword', data);
  return response.data;
};
