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

export const updateProfileEmail = async (data) => {
  const response = await api.put('/profile/email', data);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await api.post('/forgot-password', data);
  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await api.post('/verify-otp', data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post('/reset-password', data);
  return response.data;
};

export const adminResetPassword = async (userId, data) => {
  const response = await api.put(`/users/${userId}/reset-password`, data);
  return response.data;
};
