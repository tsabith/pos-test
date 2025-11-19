<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-md">
      <!-- Header -->
      <div class="p-6 border-b">
        <h3 class="text-2xl font-bold text-center">Pembayaran</h3>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <!-- Total Bayar -->
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-sm text-gray-600 text-center mb-1">Total Bayar</div>
          <div class="text-4xl font-bold text-purple-700 text-center">
            {{ formatRupiah(cartStore.totalBayar) }}
          </div>
        </div>

        <!-- Metode Pembayaran -->
        <div>
          <label class="block text-sm font-medium mb-2">Metode Pembayaran</label>
          <select
            v-model="metodeBayar"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded outline-none focus:border-purple-500"
          >
            <option value="TUNAI">💵 Tunai</option>
            <option value="QRIS">📱 QRIS</option>
            <option value="DEBIT">💳 Debit/Kredit</option>
          </select>
        </div>

        <!-- Input Uang Diterima -->
        <div>
          <label class="block text-sm font-medium mb-2">Jumlah Dibayar</label>
          <div class="relative">
            <input
              ref="uangInput"
              v-model="uangDiterimaDisplay"
              @input="handleInputChange"
              @focus="$event.target.select()"
              type="text"
              class="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded outline-none focus:border-purple-500 text-right"
              placeholder="Rp 0"
            />
          </div>
          
          <!-- Quick Amount Buttons -->
          <div class="grid grid-cols-4 gap-2 mt-2">
            <button
              v-for="amount in quickAmounts"
              :key="amount"
              @click="setQuickAmount(amount)"
              class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded font-medium"
            >
              {{ formatRupiahShort(amount) }}
            </button>
          </div>
        </div>

        <!-- Kembalian -->
        <div
          v-if="uangDiterima > 0"
          :class="[
            'p-4 rounded-lg',
            kembalian >= 0 ? 'bg-green-50' : 'bg-red-50'
          ]"
        >
          <div class="text-sm text-gray-600 mb-1">
            {{ kembalian >= 0 ? 'Kembalian' : 'Uang Kurang' }}
          </div>
          <div
            :class="[
              'text-3xl font-bold',
              kembalian >= 0 ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ formatRupiah(Math.abs(kembalian)) }}
          </div>
        </div>

        <!-- Warning -->
        <div v-if="kembalian < 0" class="flex items-start gap-2 p-3 bg-red-50 rounded border border-red-200">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="text-sm text-red-800">
            Uang yang diterima kurang dari total pembayaran!
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Batal
        </button>
        <button
          @click="processPayment"
          :disabled="kembalian < 0 || uangDiterima === 0 || processing"
          class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ processing ? 'Memproses...' : 'PROSES' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const emit = defineEmits(['close', 'success']);

const cartStore = useCartStore();
const authStore = useAuthStore();

const uangInput = ref(null);
const metodeBayar = ref('TUNAI');
const uangDiterima = ref(0);
const uangDiterimaDisplay = ref('');
const processing = ref(false);

const quickAmounts = computed(() => {
  const total = cartStore.totalBayar;
  return [
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
    Math.ceil(total / 100000) * 100000 + 50000,
    Math.ceil(total / 100000) * 100000 + 100000,
  ];
});

const kembalian = computed(() => {
  return uangDiterima.value - cartStore.totalBayar;
});

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatRupiahShort = (amount) => {
  if (amount >= 1000000) {
    return `${amount / 1000000}jt`;
  } else if (amount >= 1000) {
    return `${amount / 1000}rb`;
  }
  return amount.toString();
};

const handleInputChange = (e) => {
  // Remove non-numeric characters
  const value = e.target.value.replace(/\D/g, '');
  const numValue = parseInt(value) || 0;
  
  uangDiterima.value = numValue;
  uangDiterimaDisplay.value = numValue > 0 ? formatRupiah(numValue) : '';
};

const setQuickAmount = (amount) => {
  uangDiterima.value = amount;
  uangDiterimaDisplay.value = formatRupiah(amount);
};

const processPayment = async () => {
  if (kembalian.value < 0) {
    alert('Uang tidak cukup!');
    return;
  }

  processing.value = true;

  try {
    // Prepare transaction data
    const transactionData = {
      kasir_id: authStore.user?.id || 1,
      items: cartStore.items.map(item => ({
        produk_id: item.id_produk,
        nama_produk: item.nama,
        harga_satuan: item.harga_satuan,
        qty: item.qty,
        subtotal: item.subtotal
      })),
      total_item: cartStore.totalItem,
      subtotal: cartStore.subtotal,
      diskon: cartStore.totalDiskon,
      ppn: cartStore.totalPPN,
      total_bayar: cartStore.totalBayar,
      uang_diterima: uangDiterima.value,
      kembalian: kembalian.value,
      metode_bayar: metodeBayar.value,
      tanggal: new Date().toISOString()
    };

    // Save transaction
    const response = await api.saveTransaction(transactionData);

    // Prepare receipt data
    const receiptData = {
      noTransaksi: response.data.no_transaksi,
      tanggal: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      kasir: authStore.user?.nama || 'ADMIN',
      items: cartStore.items,
      subtotal: cartStore.subtotal,
      diskon: cartStore.totalDiskon,
      ppn: cartStore.totalPPN,
      totalBayar: cartStore.totalBayar,
      uangDiterima: uangDiterima.value,
      kembalian: kembalian.value,
      metodeBayar: metodeBayar.value
    };

    // Emit success
    emit('success', receiptData);
  } catch (error) {
    console.error('Payment error:', error);
    alert('Gagal memproses pembayaran. Silakan coba lagi.');
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  uangInput.value?.focus();
  
  // Set default to exact amount
  uangDiterima.value = cartStore.totalBayar;
  uangDiterimaDisplay.value = formatRupiah(cartStore.totalBayar);
});
</script>
