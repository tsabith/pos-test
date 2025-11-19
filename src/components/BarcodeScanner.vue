<template>
  <div class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
    <div class="relative w-full max-w-2xl mx-4">
      <!-- Close Button -->
      <button
        @click="closeScanner"
        class="absolute -top-12 right-0 z-10 bg-red-600 text-white rounded-full px-6 py-3 hover:bg-red-700 font-bold text-lg"
      >
        ✕ Tutup
      </button>

      <!-- Video Container -->
      <div class="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <div class="relative">
          <!-- Video Element -->
          <video
            ref="videoRef"
            class="w-full h-auto bg-black"
            autoplay
            playsinline
            muted
          ></video>

          <!-- Scanning Guideline Overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="absolute inset-0 bg-black bg-opacity-40"></div>
            <div class="relative z-10">
              <div class="border-4 border-green-400 w-80 h-64 rounded-2xl relative shadow-2xl">
                <div class="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl"></div>
                <div class="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr"></div>
                <div class="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl"></div>
                <div class="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br"></div>
                <div v-if="isScanning" class="absolute inset-0 overflow-hidden rounded-xl">
                  <div class="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="absolute bottom-4 left-0 right-0 px-4 text-center z-10">
            <div v-if="lastResult" class="bg-green-600 text-white px-6 py-4 rounded-lg inline-block font-bold shadow-lg text-lg">
              ✅ Terdeteksi: {{ lastResult }}
            </div>
            <div v-else-if="error" class="bg-red-600 text-white px-4 py-3 rounded-lg inline-block font-bold shadow-lg max-w-lg">
              <div class="whitespace-pre-line text-sm">{{ error }}</div>
            </div>
            <div v-else class="bg-blue-600 text-white px-6 py-4 rounded-lg inline-block font-bold shadow-lg">
              📷 Scanning... Arahkan barcode ke kotak hijau
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="p-6 bg-gray-800 text-white">
          <p class="font-bold text-lg mb-3">📱 Tips Scanning:</p>
          <ul class="space-y-2 text-sm">
            <li>✓ Jarak ideal: <strong class="text-green-400">15-25cm</strong></li>
            <li>✓ Pencahayaan <strong class="text-green-400">terang</strong></li>
            <li>✓ Pegang <strong class="text-green-400">stabil</strong> 1-2 detik</li>
            <li>✓ Barcode dalam <strong class="text-green-400">kotak hijau</strong></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/library';

const emit = defineEmits(['detected', 'close']);

const videoRef = ref(null);
const isScanning = ref(false);
const error = ref('');
const lastResult = ref('');

let codeReader = null;

const startScanner = async () => {
  try {
    error.value = '';
    isScanning.value = true;

    console.log('🎥 Starting scanner (NPM package method)...');

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser tidak mendukung akses kamera.');
    }

    console.log('✅ Browser supports camera');

    // Initialize code reader
    codeReader = new BrowserMultiFormatReader();
    console.log('✅ ZXing reader initialized');

    // Get video devices
    const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
    const cameras = videoInputDevices.filter(device => device.kind === 'videoinput');
    
    if (cameras.length === 0) {
      throw new Error('Tidak ada kamera ditemukan.');
    }

    console.log(`✅ Found ${cameras.length} camera(s):`, cameras.map(d => d.label || 'Camera'));

    // Select back camera (prefer last camera which is usually back on mobile)
    const selectedDeviceId = cameras[cameras.length - 1].deviceId;
    console.log('✅ Using camera:', cameras[cameras.length - 1].label || 'Default camera');

    // Start decoding - THIS IS THE KEY!
    codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      videoRef.value,
      (result, err) => {
        if (result) {
          const barcodeText = result.getText();
          console.log('✅✅✅ BARCODE DETECTED!');
          console.log('  Text:', barcodeText);
          console.log('  Format:', result.getBarcodeFormat());
          
          lastResult.value = barcodeText;
          isScanning.value = false;
          
          // Play beep
          playBeep();
          
          // Vibrate
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
          
          // Emit result
          emit('detected', barcodeText);
          
          // Auto close
          setTimeout(() => {
            closeScanner();
          }, 1500);
        }
        // err is normal - means no barcode detected in this frame
      }
    );

    console.log('✅ Scanner started successfully!');

  } catch (err) {
    console.error('❌ Scanner error:', err);
    isScanning.value = false;
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      error.value = '⚠️ Akses kamera ditolak.\n\nKlik icon 🔒 di address bar → Camera → Allow';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      error.value = '⚠️ Kamera tidak ditemukan.\n\nPastikan device memiliki kamera.';
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      error.value = '⚠️ Kamera sedang digunakan aplikasi lain.\n\nTutup aplikasi lain yang menggunakan kamera.';
    } else {
      error.value = `Error: ${err.message}`;
    }
  }
};

const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (err) {
    console.log('Could not play beep');
  }
};

const stopScanner = () => {
  console.log('🛑 Stopping scanner...');
  isScanning.value = false;
  
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
};

const closeScanner = () => {
  stopScanner();
  emit('close');
};

onMounted(() => {
  startScanner();
});

onBeforeUnmount(() => {
  stopScanner();
});
</script>

<style scoped>
video {
  max-height: 70vh;
  object-fit: cover;
}

@keyframes scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(250px); }
}

.animate-scan {
  animation: scan 2s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.8));
}
</style>