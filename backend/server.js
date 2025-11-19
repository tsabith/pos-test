// backend/server.js
// Express API Server for POS Kasir

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.NODE_PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ========================================
// ROUTES - PRODUK
// ========================================

// Get product by barcode
app.get('/api/produk/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const [rows] = await db.execute(
      'SELECT * FROM produk WHERE barcode = ? LIMIT 1',
      [barcode]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Search products
app.get('/api/produk/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const [rows] = await db.execute(
      'SELECT * FROM produk WHERE nama LIKE ? LIMIT 20',
      [`%${q}%`]
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all products
app.get('/api/produk', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM produk ORDER BY nama'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========================================
// ROUTES - TRANSAKSI
// ========================================

// Save transaction
app.post('/api/transaksi', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { kasir_id, items, total_item, subtotal, diskon, ppn, total_bayar, uang_diterima, kembalian, metode_bayar } = req.body;
    
    // Generate transaction number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM transaksi WHERE DATE(tanggal) = CURDATE()'
    );
    const dailyCount = countResult[0].count + 1;
    const no_transaksi = `TRX-${today}-${String(dailyCount).padStart(3, '0')}`;
    
    // Insert transaction
    const [transactionResult] = await connection.execute(
      `INSERT INTO transaksi 
       (no_transaksi, kasir_id, total_item, subtotal, diskon, ppn, total_bayar, 
        uang_diterima, kembalian, metode_bayar, tanggal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [no_transaksi, kasir_id || 1, total_item, subtotal, diskon || 0, ppn || 0, total_bayar, uang_diterima, kembalian, metode_bayar || 'TUNAI']
    );
    
    const transaksi_id = transactionResult.insertId;
    
    // Insert transaction details & update stock
    for (const item of items) {
      // Insert detail
      await connection.execute(
        `INSERT INTO transaksi_detail 
         (transaksi_id, produk_id, nama_produk, harga_satuan, qty, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [transaksi_id, item.produk_id, item.nama_produk, item.harga_satuan, item.qty, item.subtotal]
      );
      
      // Update stock
      await connection.execute(
        'UPDATE produk SET stok = stok - ? WHERE id = ?',
        [item.qty, item.produk_id]
      );
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      data: {
        no_transaksi,
        id: transaksi_id
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// ========================================
// ROUTES - AUTH
// ========================================

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const [rows] = await db.execute(
      'SELECT id, nama, username, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...rows[0],
        token: 'dummy-token-' + Date.now() // Simple token for demo
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========================================
// ROUTES - SHIFT
// ========================================

// Get active shift
app.get('/api/shift/active/:kasir_id', async (req, res) => {
  try {
    const { kasir_id } = req.params;
    
    const [rows] = await db.execute(
      'SELECT * FROM shift_kasir WHERE kasir_id = ? AND status = "active" LIMIT 1',
      [kasir_id]
    );
    
    res.json({
      success: true,
      data: rows[0] || null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Open shift
app.post('/api/shift/open', async (req, res) => {
  try {
    const { kasir_id, saldo_awal } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO shift_kasir (kasir_id, saldo_awal, waktu_mulai, status) VALUES (?, ?, NOW(), "active")',
      [kasir_id, saldo_awal]
    );
    
    res.json({
      success: true,
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Close shift
app.post('/api/shift/close', async (req, res) => {
  try {
    const { shift_id, saldo_akhir } = req.body;
    
    // Get shift info
    const [shiftRows] = await db.execute(
      'SELECT * FROM shift_kasir WHERE id = ?',
      [shift_id]
    );
    
    if (shiftRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shift tidak ditemukan'
      });
    }
    
    const shift = shiftRows[0];
    
    // Get total transactions
    const [transactionRows] = await db.execute(
      'SELECT COALESCE(SUM(total_bayar), 0) as total FROM transaksi WHERE kasir_id = ? AND tanggal >= ?',
      [shift.kasir_id, shift.waktu_mulai]
    );
    
    const total_transaksi = transactionRows[0].total;
    const selisih = saldo_akhir - (shift.saldo_awal + total_transaksi);
    
    // Update shift
    await db.execute(
      'UPDATE shift_kasir SET saldo_akhir = ?, total_transaksi = ?, selisih = ?, waktu_selesai = NOW(), status = "closed" WHERE id = ?',
      [saldo_akhir, total_transaksi, selisih, shift_id]
    );
    
    res.json({
      success: true,
      data: { selisih, total_transaksi }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========================================
// ROUTES - LAPORAN
// ========================================

// Daily report
app.get('/api/laporan/harian', async (req, res) => {
  try {
    const { tanggal } = req.query;
    
    // Get transactions
    const [transactions] = await db.execute(
      `SELECT t.*, u.nama as kasir_nama 
       FROM transaksi t 
       LEFT JOIN users u ON t.kasir_id = u.id 
       WHERE DATE(t.tanggal) = ? 
       ORDER BY t.tanggal DESC`,
      [tanggal]
    );
    
    // Get summary
    const [summary] = await db.execute(
      `SELECT 
        COUNT(*) as total_transaksi,
        COALESCE(SUM(total_bayar), 0) as total_penjualan,
        COALESCE(AVG(total_bayar), 0) as rata_rata
       FROM transaksi 
       WHERE DATE(tanggal) = ?`,
      [tanggal]
    );
    
    res.json({
      success: true,
      data: {
        transactions,
        summary: summary[0]
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========================================
// START SERVER
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 POS Kasir API Server');
  console.log('========================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ API endpoint: http://localhost:${PORT}/api`);
  console.log(`✅ Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('========================================');
});
