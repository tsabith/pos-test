<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b flex items-center justify-between">
        <h3 class="text-xl font-bold">Cari Produk</h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Search Input -->
      <div class="p-4 border-b">
        <div class="relative">
          <input
            ref="searchInput"
            v-model="searchKeyword"
            @input="handleSearch"
            type="text"
            placeholder="Ketik nama produk (min. 2 karakter)..."
            class="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded outline-none focus:border-purple-500"
          />
          <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Results -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-12 text-gray-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p class="mt-2">Mencari produk...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!searchKeyword" class="text-center py-12 text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Ketik nama produk untuk mulai mencari</p>
        </div>

        <!-- No Results -->
        <div v-else-if="searchResults.length === 0 && !loading" class="text-center py-12 text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Produk tidak ditemukan</p>
          <p class="text-sm mt-2">Coba kata kunci lain</p>
        </div>

        <!-- Results List -->
        <div v-else class="space-y-2">
          <div
            v-for="product in searchResults"
            :key="product.id"
            @click="selectProduct(product)"
            class="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="font-medium text-lg">{{ product.nama }}</h4>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span v-if="product.barcode" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    {{ product.barcode }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Stok: {{ product.stok }} {{ product.satuan }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-purple-700">
                  {{ formatRupiah(product.harga_jual) }}
                </div>
                <div class="text-sm text-gray-500">per {{ product.satuan }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t bg-gray-50 text-sm text-gray-600 text-center">
        Klik produk untuk menambahkan ke keranjang
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { mockProducts } from '../services/mockApi';

const emit = defineEmits(['select', 'close']);

const searchInput = ref(null);
const searchKeyword = ref('');
const searchResults = ref([]);
const loading = ref(false);

let searchTimeout = null;

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const handleSearch = () => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // If empty, show all products
  if (searchKeyword.value.length === 0) {
    searchResults.value = mockProducts;
    return;
  }

  // Search only if keyword >= 2 characters
  if (searchKeyword.value.length < 2) {
    searchResults.value = [];
    return;
  }

  // Debounce search (wait 300ms after user stops typing)
  searchTimeout = setTimeout(async () => {
    loading.value = true;
    
    try {
      const response = await api.searchProducts(searchKeyword.value);
      searchResults.value = response.data;
      console.log('Search results:', searchResults.value);
    } catch (error) {
      console.error('Search error:', error);
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  }, 300);
};

const selectProduct = (product) => {
  emit('select', product);
};

onMounted(() => {
  searchInput.value?.focus();
  // Show all products initially
  searchResults.value = mockProducts;
  console.log('Initial products:', mockProducts);
});
</script>