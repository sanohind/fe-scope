# Daily Use Warehouse - Format Update Guide

## 📋 Ringkasan Perubahan

Sistem Daily Use Warehouse telah diperbarui dengan format data yang **lebih sederhana dan efisien**. Perubahan utama adalah dari format harian (daily) menjadi format bulanan (monthly).

---

## 🔄 Perbandingan Format

### ❌ Format Lama (Deprecated)
```
- plan_date: tanggal spesifik (date)
- daily_use: qty untuk tanggal tersebut (integer)
```

**Masalah:**
- Satu bulan = 28-31 record
- Banyak duplikasi data
- Sulit untuk maintenance

### ✅ Format Baru (Sekarang)
```
- year: tahun (integer, 2000-2100)
- period: bulan/periode (integer, 1-12)
- qty: quantity untuk seluruh bulan (integer)
```

**Keuntungan:**
- Satu bulan = 1 record saja
- Lebih efisien (mengurangi 97% jumlah row)
- Lebih mudah maintain
- Qty konsisten untuk semua hari dalam bulan

---

## 📊 Format Excel Upload

### Template Excel
File Excel harus memiliki struktur sebagai berikut:

**Row 1-3:** Header (akan di-skip oleh sistem)

**Row 4:** Column Headers
- Column A: (kosong/numbering)
- Column B: Part Number
- Column C: Warehouse
- Column D: Year
- Column E: Period
- Column F: Qty

**Row 5+:** Data

### Contoh Data Excel

| No | Part Number | Warehouse | Year | Period | Qty |
|----|-------------|-----------|------|--------|-----|
| 1  | PART001     | WHRM01    | 2026 | 1      | 100 |
| 2  | PART002     | WHFG01    | 2026 | 1      | 150 |
| 3  | PART003     | WHRM02    | 2026 | 2      | 200 |
| 4  | PART001     | WHRM01    | 2026 | 3      | 120 |

**Penjelasan:**
- Row 1: PART001 di warehouse WHRM01 untuk Januari 2026 (period 1) memiliki qty 100 untuk **seluruh bulan**
- Row 2: PART002 di warehouse WHFG01 untuk Januari 2026 memiliki qty 150 untuk **seluruh bulan**
- Row 3: PART003 di warehouse WHRM02 untuk Februari 2026 (period 2) memiliki qty 200 untuk **seluruh bulan**

---

## 🎯 Cara Menggunakan

### 1. Upload Data
1. Buka halaman **Daily Use Upload** (`/daily-use-upload`)
2. Download template Excel dengan klik tombol "Download Template"
3. Isi data sesuai format di atas
4. Drag & drop file Excel atau klik "Browse File"
5. Sistem akan otomatis import data

### 2. Manage Data
1. Buka halaman **Daily Use Manage** (`/daily-use-manage`)
2. Gunakan filter untuk mencari data:
   - **Search:** Cari berdasarkan part number
   - **Year:** Filter berdasarkan tahun
   - **Period:** Filter berdasarkan periode/bulan
3. Data ditampilkan dalam tabel dengan kolom:
   - Part Number
   - Warehouse
   - Year
   - Period (ditampilkan sebagai nama bulan)
   - Monthly Qty (qty untuk seluruh bulan)

---

## 🔍 API Endpoints

### Import Excel
```
POST /api/daily-use-wh/import
Content-Type: multipart/form-data

Body:
- file: Excel file (.xlsx, .xls, .csv)
```

### Get Data (List)
```
GET /api/daily-use-wh?partno=PART001&year=2026&period=1&page=1&per_page=50
```

**Query Parameters:**
- `partno` (optional): Filter by part number (partial match)
- `warehouse` (optional): Filter by warehouse code
- `year` (optional): Filter by year
- `period` (optional): Filter by period/month (1-12)
- `per_page` (optional): Items per page (default: 50, max: 100)
- `page` (optional): Page number

---

## 💡 Catatan Penting

### Interpretasi Data
Jika Anda perlu mendapatkan qty untuk **tanggal spesifik**:
1. Query berdasarkan `year` dan `period`
2. Qty yang didapat berlaku untuk **SEMUA tanggal** di bulan tersebut

**Contoh:**
```
Data: year=2026, period=1, qty=100
Artinya: Setiap tanggal di Januari 2026 (1-31 Jan) memiliki qty=100
```

### Unique Key
Kombinasi berikut harus unik:
- `partno` + `warehouse` + `year` + `period`

Jika import data dengan kombinasi yang sama, sistem akan **update** record yang sudah ada.

---

## 🎨 UI Components

### Daily Use Upload Page
- **Component:** `PlanningManage.tsx`
- **Features:**
  - Drag & drop file upload
  - Download template
  - Success/error notifications
  - Navigate to manage page

### Daily Use Manage Page
- **Component:** `DailyUseManageTable.tsx`
- **Features:**
  - Search by part number
  - Filter by year and period
  - Pagination (25, 50, 100, 150 per page)
  - Responsive table with sticky header
  - Monthly qty display

---

## 📁 File Structure

```
src/
├── pages/MainPages/PlanningManage/
│   ├── daily-use-upload.tsx      # Upload page
│   └── daily-use-manage.tsx      # Manage/view page
├── components/dashboard/planning/
│   ├── PlanningManage.tsx         # Upload component
│   ├── DailyUseManageTable.tsx   # Table component
│   └── FixDropZone.tsx           # File upload dropzone
└── services/
    └── dailyUseWhApi.ts          # API service layer
```

---

## 🚀 Migration Notes

Jika Anda memiliki data lama dengan format `plan_date` dan `daily_use`:

1. **Konversi Data:**
   - Ekstrak `year` dan `period` dari `plan_date`
   - Group by `partno`, `warehouse`, `year`, `period`
   - Ambil nilai `daily_use` yang konsisten (atau rata-rata jika berbeda)

2. **Import Ulang:**
   - Gunakan format Excel baru
   - Import melalui halaman upload

---

## 📞 Support

Untuk pertanyaan atau masalah, silakan hubungi tim development.

**Last Updated:** 2026-01-13
