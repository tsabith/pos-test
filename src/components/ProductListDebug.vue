<template>
  <div class="p-4">
    <h3 class="text-xl font-bold mb-4">📦 Daftar Produk Dummy (Debug Mode)</h3>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <p class="mt-2">Loading produk...</p>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-8 text-gray-400">
      <p>❌ Tidak ada produk ditemukan</p>
    </div>

    <div v-else class="grid gap-3">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:bg-purple-50 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-bold text-lg">{{ product.nama }}</h4>
            <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
              <span v-if="product.barcode" class="flex items-center gap-1">
                📊 <code class="bg-gray-100 px-2 py-0.5 rounded">{{ product.barcode }}</code>
              </span>
              <span v-else class="text-orange-600">⚠️ No Barcode</span>
              <span class="flex items-center gap-1">
                📦 Stok: <strong>{{ product.stok }}</strong> {{ product.satuan }}
              </span>
            </div>
          </div>
          <div class="text-right ml-4">
            <div class="text-2xl font-bold text-purple-700">
              {{ formatRupiah(product.harga_jual) }}
            </div>
            <button
              @click="testProduct(product)"
              class="mt-2 px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Test Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Results -->
    <div v-if="testResult" class="mt-4 p-4 rounded" :class="testResult.success ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'">
      <div class="font-bold mb-2">
        {{ testResult.success ? '✅ Success!' : '❌ Failed!' }}
      </div>
      <pre class="text-xs">{{ testResult.message }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { mockProducts } from '../services/mockApi';
import { useCartStore } from '../stores/cartStore';

const cartStore = useCartStore();

const products = ref([]);
const loading = ref(true);
const testResult = ref(null);

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const loadProducts = async () => {
  loading.value = true;
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Load from mockProducts
    products.value = mockProducts;
    
    console.log('✅ Products loaded:', products.value.length);
  } catch (error) {
    console.error('❌ Error loading products:', error);
  } finally {
    loading.value = false;
  }
};

const testProduct = (product) => {
  try {
    const result = cartStore.addItem(product, 1);
    
    testResult.value = {
      success: result.success,
      message: result.success 
        ? `Produk "${product.nama}" berhasil ditambahkan ke cart!\nTotal item di cart: ${cartStore.items.length}`
        : result.message
    };

    // Auto clear after 3 seconds
    setTimeout(() => {
      testResult.value = null;
    }, 3000);
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message
    };
  }
};

onMounted(() => {
  loadProducts();
});
</script>