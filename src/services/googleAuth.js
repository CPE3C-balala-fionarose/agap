import api from './api';

export const googleLogin = async (credential) => {
  try {
    const response = await api.post('/auth/google', { credential });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Google login failed' };
  }
};