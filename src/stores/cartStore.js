import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    diskon: 0,
    diskonMember: false,
    ppnEnabled: false,
    metodeBayar: 'TUNAI'
  }),

  getters: {
    totalItem: (state) => state.items.reduce((sum, item) => sum + item.qty, 0),
    
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.subtotal, 0),
    
    totalDiskon: (state) => {
      if (state.diskonMember) {
        return state.subtotal * 0.05; // Diskon member 5%
      }
      return state.diskon;
    },
    
    totalPPN: (state) => {
      if (state.ppnEnabled) {
        return (state.subtotal - state.totalDiskon) * 0.11; // PPN 11%
      }
      return 0;
    },
    
    totalBayar: (state) => {
      return state.subtotal - state.totalDiskon + state.totalPPN;
    },

    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    addItem(produk, qty = 1) {
      const existingItem = this.items.find(item => item.id_produk === produk.id);
      
      if (existingItem) {
        // Update qty jika produk sudah ada
        const newQty = existingItem.qty + qty;
        if (newQty > produk.stok) {
          return { success: false, message: 'Stok tidak mencukupi' };
        }
        existingItem.qty = newQty;
        existingItem.subtotal = existingItem.harga_satuan * newQty;
      } else {
        // Tambah item baru
        if (qty > produk.stok) {
          return { success: false, message: 'Stok tidak mencukupi' };
        }
        this.items.push({
          id_produk: produk.id,
          nama: produk.nama,
          barcode: produk.barcode,
          harga_satuan: produk.harga_jual,
          qty: qty,
          subtotal: produk.harga_jual * qty,
          satuan: produk.satuan,
          stok_tersedia: produk.stok
        });
      }
      
      return { success: true };
    },

    updateQty(idProduk, newQty) {
      const item = this.items.find(i => i.id_produk === idProduk);
      if (!item) return { success: false };

      if (newQty <= 0) {
        return this.removeItem(idProduk);
      }

      if (newQty > item.stok_tersedia) {
        return { success: false, message: 'Stok tidak mencukupi' };
      }

      item.qty = newQty;
      item.subtotal = item.harga_satuan * newQty;
      return { success: true };
    },

    removeItem(idProduk) {
      const index = this.items.findIndex(i => i.id_produk === idProduk);
      if (index > -1) {
        this.items.splice(index, 1);
        return { success: true };
      }
      return { success: false };
    },

    clearCart() {
      this.items = [];
      this.diskon = 0;
      this.diskonMember = false;
      this.ppnEnabled = false;
      this.metodeBayar = 'TUNAI';
    },

    setDiskon(amount) {
      this.diskon = amount;
    },

    toggleDiskonMember() {
      this.diskonMember = !this.diskonMember;
      if (this.diskonMember) {
        this.diskon = 0; // Reset diskon manual kalau pakai diskon member
      }
    },

    togglePPN() {
      this.ppnEnabled = !this.ppnEnabled;
    },

    setMetodeBayar(metode) {
      this.metodeBayar = metode;
    }
  }
});
