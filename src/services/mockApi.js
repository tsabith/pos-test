export const mockProducts = [
  { id: 1, nama: 'KANGGURU SQUARE PUFF', barcode: '8992761121006', harga_jual: 15000, stok: 83, satuan: 'PCS' },
  { id: 2, nama: 'LARUTAN KAKI TIGA', barcode: '8992745200116', harga_jual: 6000, stok: 993, satuan: 'PCS' },
  { id: 3, nama: 'CHOCHOLATOS RENTENG', barcode: '8992745100234', harga_jual: 19000, stok: 87, satuan: 'PCS' },
  { id: 4, nama: 'SASA T. BUMBU KENTUCKY', barcode: '8992745300345', harga_jual: 5000, stok: 99, satuan: 'PCS' },
  { id: 5, nama: 'RELAXA BARLEY MINT', barcode: '8992745400456', harga_jual: 9000, stok: 1008, satuan: 'PCS' },
  { id: 6, nama: 'INDOMIE GORENG', barcode: '089686010107', harga_jual: 3500, stok: 500, satuan: 'PCS' },
  { id: 7, nama: 'AQUA 600ML', barcode: '899999017256', harga_jual: 3000, stok: 200, satuan: 'PCS' },
  { id: 8, nama: 'TARO NET 160G', barcode: null, harga_jual: 12000, stok: 50, satuan: 'PCS' }, // Tanpa barcode
  { id: 9, nama: 'MINYAK GORENG BIMOLI 2L', barcode: '8992771123456', harga_jual: 35000, stok: 75, satuan: 'PCS' },
  { id: 10, nama: 'GULA PASIR GULAKU 1KG', barcode: '8992871234567', harga_jual: 15000, stok: 120, satuan: 'KG' }
];

let transactionCounter = 1;

export const mockApi = {
  // Search produk by barcode
  async getProductByBarcode(barcode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = mockProducts.find(p => p.barcode === barcode);
        if (product) {
          resolve({ success: true, data: product });
        } else {
          reject({ success: false, message: 'Produk tidak ditemukan' });
        }
      }, 300);
    });
  },

  // Search produk by nama
  async searchProducts(keyword) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockProducts.filter(p => 
          p.nama.toLowerCase().includes(keyword.toLowerCase())
        );
        resolve({ success: true, data: results });
      }, 300);
    });
  },

  // Simpan transaksi
  async saveTransaction(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const noTransaksi = `TRX-${dateStr}-${String(transactionCounter).padStart(3, '0')}`;
        transactionCounter++;

        // Simulasi kurangi stok
        data.items.forEach(item => {
          const product = mockProducts.find(p => p.id === item.id_produk);
          if (product) {
            product.stok -= item.qty;
          }
        });

        resolve({ 
          success: true, 
          data: { 
            no_transaksi: noTransaksi,
            ...data 
          } 
        });
      }, 500);
    });
  },

  // Login kasir
  async login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          resolve({ 
            success: true, 
            data: { 
              id: 1, 
              nama: 'ADMIN',
              username: 'admin',
              token: 'mock-token-12345' 
            } 
          });
        } else {
          reject({ success: false, message: 'Username atau password salah' });
        }
      }, 500);
    });
  }
};
