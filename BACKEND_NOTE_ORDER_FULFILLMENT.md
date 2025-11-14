# Backend Note: Order Fulfillment Data Integration

## Issue
Pada tahun 2025, data Order Fulfillment hanya menampilkan bulan Agustus, September, Oktober, dan November.

## Root Cause
Data tersimpan di 2 database berbeda:
- **ERP2 (MySQL)**: Data sebelum Agustus 2025 (Jan-Jul 2025)
  - Table: `so_invoice_line_2`
- **ERP (SQL Server)**: Data Agustus 2025 ke atas
  - Table: `so_invoice_line`

## Solution Required (Backend)
Backend API endpoint `/api/dashboard/sales/order-fulfillment` harus:

1. **Query kedua database** berdasarkan date range yang diberikan:
   ```
   Jika date_from atau date_to mencakup periode sebelum Agustus 2025:
     → Query data dari ERP2 (so_invoice_line_2) untuk Jan-Jul 2025
   
   Jika date_from atau date_to mencakup periode Agustus 2025+:
     → Query data dari ERP (so_invoice_line) untuk Aug 2025+
   ```

2. **Merge data** dari kedua sumber:
   - Gabungkan hasil query dari ERP2 dan ERP
   - Urutkan berdasarkan periode (ascending)
   - Return sebagai satu array data yang utuh

3. **Contoh implementasi logic**:
   ```python
   def get_order_fulfillment(date_from, date_to):
       results = []
       
       # Check if date range includes pre-August 2025
       if date_from < "2025-08-01":
           # Query ERP2 for Jan-Jul 2025 data
           erp2_data = query_erp2_database(date_from, min(date_to, "2025-07-31"))
           results.extend(erp2_data)
       
       # Check if date range includes August 2025 onwards
       if date_to >= "2025-08-01":
           # Query ERP for Aug 2025+ data
           erp_data = query_erp_database(max(date_from, "2025-08-01"), date_to)
           results.extend(erp_data)
       
       return results
   ```

## Frontend Changes (Completed)
Frontend sudah diupdate untuk:
- ✅ Default year: Tahun sekarang (2025)
- ✅ Removed "All Years" option
- ✅ Dropdown menampilkan tahun-tahun yang tersedia dari data

## Expected Result
Ketika user memilih tahun 2025, API harus return data lengkap untuk 12 bulan:
- Jan-Jul 2025: Dari ERP2 (so_invoice_line_2)
- Aug-Nov 2025: Dari ERP (so_invoice_line)

## Reference
- Dokumentasi: `DASHBOARD4_API_UPDATES.md` line 220-234
- API Endpoint: `GET /api/dashboard/sales/order-fulfillment`
- Frontend Component: `src/components/dashboard/sales/OrderFulfillment.tsx`

**Status**: Frontend sudah siap, menunggu backend untuk implement data merging dari 2 database.
