<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <!-- Receipt Content -->
      <div id="receipt-print" class="font-mono text-sm">
        <!-- Header -->
        <div class="text-center border-b-2 border-dashed pb-4 mb-4">
          <h2 class="text-lg font-bold">{{ tokoInfo.nama }}</h2>
          <p class="text-xs mt-1">{{ tokoInfo.alamat }}</p>
          <p class="text-xs">Telp: {{ tokoInfo.telp }}</p>
        </div>

        <!-- Transaction Info -->
        <div class="space-y-1 text-xs mb-4">
          <div class="flex justify-between">
            <span>Kasir</span>
            <span>: {{ data.kasir }}</span>
          </div>
          <div class="flex justify-between">
            <span>No Trx</span>
            <span>: {{ data.noTransaksi }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tanggal</span>
            <span>: {{ data.tanggal }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="border-t-2 border-dashed pt-2 mb-2">
          <div v-for="(item, index) in data.items" :key="index" class="mb-3">
            <div class="font-medium">{{ item.nama }}</div>
            <div class="flex justify-between text-xs mt-1">
              <span>{{ item.qty }} x {{ formatRupiah(item.harga_satuan) }}</span>
              <span class="font-medium">{{ formatRupiah(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="border-t-2 border-dashed pt-2 space-y-1 text-xs">
          <div class="flex justify-between">
            <span>Total Item</span>
            <span>: {{ data.items.reduce((sum, i) => sum + i.qty, 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>: {{ formatRupiah(data.subtotal) }}</span>
          </div>
          <div v-if="data.diskon > 0" class="flex justify-between">
            <span>Diskon</span>
            <span>: -{{ formatRupiah(data.diskon) }}</span>
          </div>
          <div v-if="data.ppn > 0" class="flex justify-between">
            <span>PPN 11%</span>
            <span>: {{ formatRupiah(data.ppn) }}</span>
          </div>
        </div>

        <!-- Total -->
        <div class="border-t-2 pt-2 mt-2">
          <div class="flex justify-between font-bold text-base">
            <span>TOTAL BAYAR</span>
            <span>{{ formatRupiah(data.totalBayar) }}</span>
          </div>
          <div class="flex justify-between text-xs mt-2">
            <span>{{ data.metodeBayar }}</span>
            <span>: {{ formatRupiah(data.uangDiterima) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span>Kembalian</span>
            <span>: {{ formatRupiah(data.kembalian) }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center border-t-2 border-dashed mt-4 pt-4 text-xs">
          <p class="font-medium">Terima Kasih & Selamat Belanja!</p>
          <p class="mt-2 text-[10px] text-gray-600">{{ tokoInfo.tagline }}</p>
        </div>

        <!-- Barcode (Optional) -->
        <div class="text-center mt-4">
          <svg class="mx-auto h-12" viewBox="0 0 200 50">
            <g v-for="(bar, i) in generateBarcode(data.noTransaksi)" :key="i">
              <rect
                :x="i * 4"
                y="0"
                :width="bar ? 3 : 2"
                height="40"
                :fill="bar ? '#000' : '#fff'"
              />
            </g>
          </svg>
          <p class="text-[10px] mt-1">{{ data.noTransaksi }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6 print:hidden">
        <button
          @click="$emit('close')"
          class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
        >
          Tutup
        </button>
        <button
          @click="printReceipt"
          class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak Struk
        </button>
      </div>

      <!-- Bluetooth Print Button (Optional) -->
      <button
        v-if="bluetoothSupported"
        @click="printViaBluetooth"
        class="w-full mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2 print:hidden"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        Cetak via Bluetooth Printer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const tokoInfo = ref({
  nama: 'TOKO ANDA',
  alamat: 'Jl. Contoh No. 123, Yogyakarta',
  telp: '0274-123456',
  tagline: 'Belanja Puas, Harga Pas!'
});

const bluetoothSupported = computed(() => {
  return 'bluetooth' in navigator;
});

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Generate simple barcode pattern
const generateBarcode = (text) => {
  const pattern = [];
  for (let i = 0; i < 50; i++) {
    pattern.push(Math.random() > 0.5);
  }
  return pattern;
};

// Print via browser
const printReceipt = () => {
  window.print();
  
  // Close after print
  setTimeout(() => {
    emit('close');
  }, 1000);
};

// Print via Bluetooth (Advanced - Experimental)
const printViaBluetooth = async () => {
  try {
    // Check if Web Bluetooth is supported
    if (!('bluetooth' in navigator)) {
      alert('Bluetooth tidak didukung di browser ini. Gunakan Chrome atau Edge.');
      return;
    }

    // Request Bluetooth device (thermal printer)
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // Printer service UUID
      optionalServices: ['battery_service']
    });

    alert('Printer ditemukan: ' + device.name + '\n\nFitur ini masih dalam pengembangan. Untuk saat ini gunakan tombol "Cetak Struk" untuk print lewat browser.');

    // TODO: Implement ESC/POS commands untuk thermal printer
    // Butuh library tambahan seperti escpos-buffer atau esc-pos-encoder
    
  } catch (error) {
    console.error('Bluetooth error:', error);
    
    if (error.name === 'NotFoundError') {
      alert('Printer Bluetooth tidak ditemukan. Pastikan printer sudah menyala dan dalam mode pairing.');
    } else {
      alert('Gagal terhubung ke printer: ' + error.message);
    }
  }
};
</script>

<style scoped>
@media print {
  #receipt-print {
    width: 80mm;
    margin: 0;
    padding: 10mm;
  }
}
</style>
