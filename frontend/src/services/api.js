import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export const auditService = {
  uploadAsset: async (file) => {
    const formData = new FormData();
    formData.append('asset', file);

    const response = await api.post('/audit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};