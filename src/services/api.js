// src/services/api.js
// API Service - Updated for Electron IPC

import { mockApi } from './mockApi';

// Check if running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI;
};

// Use mock data in browser, real database in Electron
const USE_MOCK_API = !isElectron();

console.log('API Mode:', USE_MOCK_API ? 'Mock Data (Browser)' : 'Electron IPC (Desktop App)');

export default {
  // ========================================
  // PRODUCT APIs
  // ========================================
  
  async getProductByBarcode(barcode) {
    if (USE_MOCK_API) {
      return mockApi.getProductByBarcode(barcode);
    }
    
    try {
      const result = await window.electronAPI.getProductByBarcode(barcode);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  async searchProducts(keyword) {
    if (USE_MOCK_API) {
      return mockApi.searchProducts(keyword);
    }
    
    try {
      const result = await window.electronAPI.searchProducts(keyword);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  async getAllProducts() {
    if (USE_MOCK_API) {
      return { success: true, data: mockApi.mockProducts };
    }
    
    try {
      const result = await window.electronAPI.getAllProducts();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  // ========================================
  // TRANSACTION APIs
  // ========================================
  
  async saveTransaction(data) {
    if (USE_MOCK_API) {
      return mockApi.saveTransaction(data);
    }
    
    try {
      const result = await window.electronAPI.saveTransaction(data);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  // ========================================
  // AUTH APIs
  // ========================================
  
  async login(username, password) {
    if (USE_MOCK_API) {
      return mockApi.login(username, password);
    }
    
    try {
      const result = await window.electronAPI.login({ username, password });
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  // ========================================
  // SHIFT APIs
  // ========================================
  
  async getActiveShift(kasirId) {
    if (USE_MOCK_API) {
      return { success: true, data: null };
    }
    
    try {
      const result = await window.electronAPI.getActiveShift(kasirId);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  async openShift(data) {
    if (USE_MOCK_API) {
      return { success: true, data: { id: 1 } };
    }
    
    try {
      const result = await window.electronAPI.openShift(data);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  async closeShift(data) {
    if (USE_MOCK_API) {
      return { success: true, data: { selisih: 0 } };
    }
    
    try {
      const result = await window.electronAPI.closeShift(data);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  },

  // ========================================
  // REPORT APIs
  // ========================================
  
  async getDailyReport(tanggal) {
    if (USE_MOCK_API) {
      return { 
        success: true, 
        data: {
          transactions: [],
          summary: { total_transaksi: 0, total_penjualan: 0, rata_rata: 0 }
        }
      };
    }
    
    try {
      const result = await window.electronAPI.getDailyReport(tanggal);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: error.message };
    }
  }
};