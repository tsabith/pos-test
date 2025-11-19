<template>
  <div class="h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <div class="bg-purple-700 text-white px-6 py-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">TRANSAKSI PENJUALAN</h1>
      <div class="flex items-center gap-4">
        <button
          @click="showDebugProducts = !showDebugProducts"
          class="px-4 py-2 bg-yellow-500 text-black rounded text-sm font-bold hover:bg-yellow-400"
        >
          🔧 {{ showDebugProducts ? 'Hide' : 'Show' }} Debug
        </button>
        <div class="text-right">
          <div class="text-sm">{{ currentDateTime }}</div>
          <div class="text-sm">Kasir: {{ authStore.user?.nama || 'ADMIN' }}</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex gap-4 p-4 overflow-hidden">
      <!-- Debug Products Panel (Collapsible) -->
      <div v-if="showDebugProducts" class="w-96 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div class="bg-yellow-100 p-3 border-b">
          <h3 class="font-bold">🔧 Debug: Product List</h3>
        </div>
        <div class="flex-1 overflow-y-auto">
          <ProductListDebug />
        </div>
      </div>

      <!-- Left Panel - Customer (Optional) -->
      <div class="w-64 bg-white rounded-lg shadow p-4">
        <div class="border-2 border-gray-300 rounded p-2 mb-4">
          <input
            type="text"
            placeholder="Cari customer..."
            class="w-full outline-none text-sm"
          />
        </div>
        <div class="text-center py-8 text-gray-400">
          <p class="text-sm">Rp. 0.00</p>
          <p class="text-xs mt-2">Saldo Piutang</p>
        </div>
      </div>

      <!-- Center Panel - Products & Cart -->
      <div class="flex-1 flex flex-col gap-4">
        <!-- Barcode Input -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <input
                ref="barcodeInput"
                v-model="barcodeValue"
                @keyup.enter="handleBarcodeSubmit"
                type="text"
                placeholder="Ketikkan kode disini..."
                class="w-full px-4 py-3 border-2 border-gray-300 rounded outline-none focus:border-purple-500"
              />
            </div>
            <button
              @click="showScanner = true"
              class="bg-purple-600 text-white px-6 rounded hover:bg-purple-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scan
            </button>
            <button
              @click="showSearchModal = true"
              class="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari
            </button>
          </div>
        </div>

        <!-- Cart Table -->
        <div class="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div class="bg-yellow-50 p-2 flex gap-2">
            <button @click="clearCart" class="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th class="p-2 text-left">No.</th>
                  <th class="p-2 text-left">Nama Barang</th>
                  <th class="p-2 text-center">Jumlah</th>
                  <th class="p-2 text-center">Satuan</th>
                  <th class="p-2 text-right">Harga Satuan</th>
                  <th class="p-2 text-right">Total</th>
                  <th class="p-2 text-center">Stok</th>
                  <th class="p-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in cartStore.items" :key="item.id_produk" class="border-b hover:bg-gray-50">
                  <td class="p-2">{{ index + 1 }}</td>
                  <td class="p-2">{{ item.nama }}</td>
                  <td class="p-2 text-center">
                    <input
                      :value="item.qty"
                      @change="updateQty(item.id_produk, $event.target.value)"
                      type="number"
                      class="w-16 text-center border rounded px-1"
                      min="1"
                    />
                  </td>
                  <td class="p-2 text-center">{{ item.satuan }}</td>
                  <td class="p-2 text-right">{{ formatRupiah(item.harga_satuan) }}</td>
                  <td class="p-2 text-right font-medium">{{ formatRupiah(item.subtotal) }}</td>
                  <td class="p-2 text-center">{{ item.stok_tersedia }} {{ item.satuan }}</td>
                  <td class="p-2">
                    <button
                      @click="removeItem(item.id_produk)"
                      class="text-red-500 hover:text-red-700"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="cartStore.isEmpty" class="text-center py-20 text-gray-400">
              <svg class="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Keranjang kosong</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Payment Summary -->
      <div class="w-96 bg-white rounded-lg shadow p-4 flex flex-col">
        <div class="bg-purple-700 text-white text-center py-4 rounded-t-lg -mx-4 -mt-4 mb-4">
          <h2 class="text-xl font-bold">TOTAL BELANJA</h2>
          <div class="text-4xl font-bold mt-2">{{ formatRupiah(cartStore.totalBayar) }}</div>
        </div>

        <div class="flex-1 space-y-3">
          <div class="flex justify-between items-center">
            <label class="flex items-center gap-2">
              <input
                v-model="cartStore.diskonMember"
                @change="cartStore.toggleDiskonMember"
                type="checkbox"
                class="w-4 h-4"
              />
              <span class="text-sm">Diskon Member (5%)</span>
            </label>
          </div>

          <div v-if="!cartStore.diskonMember">
            <label class="text-sm text-gray-600">Diskon Manual</label>
            <input
              v-model.number="cartStore.diskon"
              type="number"
              class="w-full px-3 py-2 border rounded mt-1"
              placeholder="0"
            />
          </div>

          <div class="flex justify-between items-center">
            <label class="flex items-center gap-2">
              <input
                v-model="cartStore.ppnEnabled"
                @change="cartStore.togglePPN"
                type="checkbox"
                class="w-4 h-4"
              />
              <span class="text-sm">PPN 11%</span>
            </label>
          </div>

          <div class="border-t pt-3 space-y-2">
            <div class="flex justify-between text-sm">
              <span>Total Item</span>
              <span class="font-medium">{{ cartStore.totalItem }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Subtotal</span>
              <span class="font-medium">{{ formatRupiah(cartStore.subtotal) }}</span>
            </div>
            <div v-if="cartStore.totalDiskon > 0" class="flex justify-between text-sm text-red-600">
              <span>Diskon</span>
              <span class="font-medium">-{{ formatRupiah(cartStore.totalDiskon) }}</span>
            </div>
            <div v-if="cartStore.totalPPN > 0" class="flex justify-between text-sm">
              <span>PPN</span>
              <span class="font-medium">{{ formatRupiah(cartStore.totalPPN) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total Tagihan</span>
              <span>{{ formatRupiah(cartStore.totalBayar) }}</span>
            </div>
          </div>
        </div>

        <button
          @click="handlePayment"
          :disabled="cartStore.isEmpty"
          class="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
        >
          BAYAR
        </button>
      </div>
    </div>

    <!-- Barcode Scanner Modal -->
    <BarcodeScanner
      v-if="showScanner"
      @detected="onBarcodeDetected"
      @close="showScanner = false"
    />

    <!-- Product Search Modal -->
    <ProductSearchModal
      v-if="showSearchModal"
      @select="onProductSelect"
      @close="showSearchModal = false"
    />

    <!-- Payment Modal -->
    <PaymentModal
      v-if="showPayment"
      @close="showPayment = false"
      @success="onPaymentSuccess"
    />

    <!-- Receipt Print -->
    <ReceiptPrint
      v-if="showReceipt"
      :data="receiptData"
      @close="closeReceipt"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import BarcodeScanner from '../components/BarcodeScanner.vue';
import ProductSearchModal from '../components/ProductSearchModal.vue';
import PaymentModal from '../components/PaymentModal.vue';
import ReceiptPrint from '../components/ReceiptPrint.vue';
import ProductListDebug from '../components/ProductListDebug.vue';

const cartStore = useCartStore();
const authStore = useAuthStore();

const barcodeInput = ref(null);
const barcodeValue = ref('');
const showScanner = ref(false);
const showSearchModal = ref(false);
const showPayment = ref(false);
const showReceipt = ref(false);
const showDebugProducts = ref(false);
const receiptData = ref(null);
const currentDateTime = ref('');

// Format currency
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Update datetime
const updateDateTime = () => {
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  currentDateTime.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} | ${now.toLocaleTimeString('id-ID')}`;
};

// Handle barcode submit
const handleBarcodeSubmit = async () => {
  if (!barcodeValue.value.trim()) return;
  
  console.log('🔍 Searching barcode:', barcodeValue.value);
  
  try {
    const response = await api.getProductByBarcode(barcodeValue.value);
    console.log('✅ Product found:', response.data);
    
    const result = cartStore.addItem(response.data);
    
    if (!result.success) {
      alert(result.message);
    } else {
      console.log('✅ Added to cart');
    }
    
    barcodeValue.value = '';
    barcodeInput.value?.focus();
  } catch (error) {
    console.error('❌ Product not found:', error);
    alert('Produk tidak ditemukan! Barcode: ' + barcodeValue.value);
    barcodeValue.value = '';
  }
};

// Request camera permission
const requestCameraPermission = async () => {
  try {
    console.log('📱 Requesting camera permission...');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log('✅ Camera permission granted');
    stream.getTracks().forEach(track => track.stop());
    showScanner.value = true;
  } catch (error) {
    console.error('❌ Camera permission denied:', error);
    alert('⚠️ Akses kamera ditolak!\n\nCara mengizinkan:\n\n1. Klik icon 🔒 di address bar\n2. Pilih "Site settings"\n3. Ubah Camera menjadi "Allow"\n4. Refresh halaman');
  }
};

// Handle barcode detected from camera
const onBarcodeDetected = async (barcode) => {
  console.log('📷 Barcode scanned:', barcode);
  showScanner.value = false;
  try {
    const response = await api.getProductByBarcode(barcode);
    const result = cartStore.addItem(response.data);
    
    if (!result.success) {
      alert(result.message);
    }
  } catch (error) {
    alert('Produk tidak ditemukan!');
  }
};

// Handle product selection from search
const onProductSelect = (product) => {
  const result = cartStore.addItem(product);
  if (!result.success) {
    alert(result.message);
  }
  showSearchModal.value = false;
};

// Update qty
const updateQty = (idProduk, newQty) => {
  const result = cartStore.updateQty(idProduk, parseInt(newQty));
  if (!result.success && result.message) {
    alert(result.message);
  }
};

// Remove item
const removeItem = (idProduk) => {
  cartStore.removeItem(idProduk);
};

// Clear cart
const clearCart = () => {
  if (confirm('Hapus semua item dari keranjang?')) {
    cartStore.clearCart();
  }
};

// Handle payment
const handlePayment = () => {
  if (cartStore.isEmpty) {
    alert('Keranjang kosong!');
    return;
  }
  showPayment.value = true;
};

// Handle payment success
const onPaymentSuccess = (data) => {
  showPayment.value = false;
  receiptData.value = data;
  showReceipt.value = true;
};

// Close receipt and reset
const closeReceipt = () => {
  showReceipt.value = false;
  receiptData.value = null;
  cartStore.clearCart();
};

onMounted(() => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  barcodeInput.value?.focus();
});
</script>