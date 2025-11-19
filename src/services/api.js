import axios from 'axios';
import { mockApi } from './mockApi';

// Toggle ini untuk switch antara mock dan real API
const USE_MOCK_API = true; // Ubah jadi false kalau Laravel sudah ready

const apiClient = axios.create({
  baseURL: 'http://192.168.1.100:8000/api', // Ganti dengan IP server Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor untuk attach token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // Login
  async login(username, password) {
    if (USE_MOCK_API) {
      return mockApi.login(username, password);
    }
    const response = await apiClient.post('/login', { username, password });
    return response.data;
  },

  // Get produk by barcode
  async getProductByBarcode(barcode) {
    if (USE_MOCK_API) {
      return mockApi.getProductByBarcode(barcode);
    }
    const response = await apiClient.get(`/produk/barcode/${barcode}`);
    return response.data;
  },

  // Search produk
  async searchProducts(keyword) {
    if (USE_MOCK_API) {
      return mockApi.searchProducts(keyword);
    }
    const response = await apiClient.get(`/produk/search?q=${keyword}`);
    return response.data;
  },

  // Simpan transaksi
  async saveTransaction(data) {
    if (USE_MOCK_API) {
      return mockApi.saveTransaction(data);
    }
    const response = await apiClient.post('/transaksi', data);
    return response.data;
  }
};
