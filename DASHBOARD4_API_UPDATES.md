# Dashboard 4 API Updates Guide

## Ringkasan Perubahan
Dokumen ini menjelaskan perubahan yang dilakukan pada 3 endpoint Dashboard 4:
1. **Shipment Status Tracking** - Diubah ke Bar Chart dengan Receipts
2. **Sales Order Fulfillment** - Diubah ke Bar Chart (Delivered Qty Only)
3. **Monthly Sales Comparison** - Diubah dari Year-over-Year ke Month-over-Month

---

## 1. Shipment Status Tracking API

### Endpoint
```
GET /api/dashboard4/shipment-status-tracking
```

### Perubahan
- **Sebelumnya**: Funnel Chart dengan conversion rates
- **Sekarang**: Bar Chart dengan 5 stages termasuk Receipts Confirmed
- **Data Source**: Menggunakan `SoInvoiceLine` (ERP) karena hanya ERP yang memiliki data receipt

### Response Format
```json
{
  "data": [
    {
      "stage": "Sales Orders Created",
      "count": 1500
    },
    {
      "stage": "Shipments Generated",
      "count": 1450
    },
    {
      "stage": "Receipts Confirmed",
      "count": 1400
    },
    {
      "stage": "Invoices Issued",
      "count": 1380
    },
    {
      "stage": "Invoices Posted",
      "count": 1200
    }
  ]
}
```

### Query Parameters
Tidak ada parameter (menampilkan data keseluruhan dari ERP)

### Notes
- Data diambil dari `so_invoice_line` (ERP) bukan `so_invoice_line_2` (ERP2)
- Status invoice yang dihitung adalah "Posted" bukan "Paid"

---

## 2. Sales Order Fulfillment API

### Endpoint
```
GET /api/dashboard4/sales-order-fulfillment
```

### Perubahan
- **Sebelumnya**: Combo Chart dengan delivered_qty, invoiced_qty, dan fulfillment_rate
- **Sekarang**: Bar Chart hanya menampilkan `delivered_qty` per periode

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `monthly` | Filter periode: `monthly` atau `yearly` |
| `date_from` | date | - | Tanggal mulai (format: YYYY-MM-DD) |
| `date_to` | date | - | Tanggal akhir (format: YYYY-MM-DD) |
| `product_type` | string | - | Filter berdasarkan tipe produk |
| `customer` | string | - | Filter berdasarkan nama customer |

### Response Format
```json
{
  "data": [
    {
      "period": "2025-08",
      "delivered_qty": 15000
    },
    {
      "period": "2025-09",
      "delivered_qty": 18500
    },
    {
      "period": "2025-10",
      "delivered_qty": 20000
    }
  ],
  "filter_metadata": {
    "period": "monthly",
    "date_field": "invoice_date",
    "date_from": "2025-01-01",
    "date_to": "2025-10-31"
  }
}
```

### Contoh Request
```bash
# Monthly view (default)
GET /api/dashboard4/sales-order-fulfillment

# Yearly view
GET /api/dashboard4/sales-order-fulfillment?period=yearly

# With date range
GET /api/dashboard4/sales-order-fulfillment?period=monthly&date_from=2025-01-01&date_to=2025-10-31

# With filters
GET /api/dashboard4/sales-order-fulfillment?period=monthly&product_type=FG&customer=PT%20ABC
```

### Notes
- Hanya support `monthly` dan `yearly` period (tidak ada `daily`)
- Data split: Agustus 2025+ dari ERP, sebelumnya dari ERP2

---

## 3. Monthly Sales Comparison API

### Endpoint
```
GET /api/dashboard4/monthly-sales-comparison
```

### Perubahan
- **Sebelumnya**: Year-over-Year comparison (current year vs previous year)
- **Sekarang**: Month-over-Month comparison (bulan ini vs bulan lalu)

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date_from` | date | 12 bulan lalu | Tanggal mulai (format: YYYY-MM-DD) |
| `date_to` | date | Bulan sekarang | Tanggal akhir (format: YYYY-MM-DD) |
| `product_type` | string | - | Filter berdasarkan tipe produk |
| `customer` | string | - | Filter berdasarkan nama customer |

### Response Format
```json
{
  "data": [
    {
      "period": "2024-11",
      "revenue": 1500000,
      "previous_month_revenue": null,
      "mom_growth": null
    },
    {
      "period": "2024-12",
      "revenue": 1750000,
      "previous_month_revenue": 1500000,
      "mom_growth": 16.67
    },
    {
      "period": "2025-01",
      "revenue": 2000000,
      "previous_month_revenue": 1750000,
      "mom_growth": 14.29
    },
    {
      "period": "2025-08",
      "revenue": 2500000,
      "previous_month_revenue": 2200000,
      "mom_growth": 13.64
    }
  ],
  "date_from": "2024-11-01",
  "date_to": "2025-10-31"
}
```

### Response Fields Explanation
- `period`: Periode bulan (format: YYYY-MM)
- `revenue`: Total revenue untuk bulan tersebut
- `previous_month_revenue`: Revenue bulan sebelumnya (null untuk bulan pertama)
- `mom_growth`: Persentase pertumbuhan Month-over-Month (null untuk bulan pertama)

### Contoh Request
```bash
# Default: 12 bulan terakhir
GET /api/dashboard4/monthly-sales-comparison

# Custom date range
GET /api/dashboard4/monthly-sales-comparison?date_from=2024-01-01&date_to=2025-10-31

# Dengan filter product type
GET /api/dashboard4/monthly-sales-comparison?product_type=FG

# Dengan filter customer
GET /api/dashboard4/monthly-sales-comparison?customer=PT%20ABC

# Kombinasi filters
GET /api/dashboard4/monthly-sales-comparison?date_from=2025-01-01&date_to=2025-10-31&product_type=FG&customer=PT%20ABC
```

### Auto-Update Behavior
API ini **otomatis update setiap bulan**:

| Bulan Akses | date_from (default) | date_to (default) | Data Ditampilkan |
|-------------|---------------------|-------------------|------------------|
| November 2025 | 2024-12-01 | 2025-11-30 | Des 2024 - Nov 2025 |
| Desember 2025 | 2025-01-01 | 2025-12-31 | Jan 2025 - Des 2025 |
| Januari 2026 | 2025-02-01 | 2026-01-31 | Feb 2025 - Jan 2026 |

### Notes
- Data split: Agustus 2025+ dari ERP (`so_invoice_line`), sebelumnya dari ERP2 (`so_invoice_line_2`)
- MoM Growth dihitung otomatis: `((current_revenue - previous_revenue) / previous_revenue) * 100`
- Bulan pertama dalam range akan memiliki `previous_month_revenue` dan `mom_growth` sebagai `null`

---

## Data Source Rules (Berlaku untuk Semua Endpoint)

### ERP vs ERP2 Split
```
┌─────────────────────────────────────────────────────────┐
│  Timeline                                               │
├─────────────────────────────────────────────────────────┤
│  ... 2023  │  2024  │ Jan-Jul 2025 │ Aug 2025+ ...     │
│    ERP2    │  ERP2  │    ERP2      │      ERP          │
└─────────────────────────────────────────────────────────┘
```

- **Sebelum Agustus 2025**: Data dari `so_invoice_line_2` (MySQL - ERP2)
- **Agustus 2025 ke atas**: Data dari `so_invoice_line` (SQL Server - ERP)

---

## Testing Endpoints

### Postman Collection
```json
{
  "info": {
    "name": "Dashboard 4 - Updated Endpoints"
  },
  "item": [
    {
      "name": "Shipment Status Tracking",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/dashboard4/shipment-status-tracking"
      }
    },
    {
      "name": "Sales Order Fulfillment - Monthly",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/dashboard4/sales-order-fulfillment?period=monthly"
      }
    },
    {
      "name": "Monthly Sales Comparison",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/dashboard4/monthly-sales-comparison"
      }
    }
  ]
}
```

---

## Migration Checklist untuk Frontend

- [ ] Update Shipment Status Tracking chart dari Funnel ke Bar Chart
- [ ] Tambahkan "Receipts Confirmed" stage di chart
- [ ] Update Sales Order Fulfillment untuk hanya menampilkan delivered_qty
- [ ] Ganti chart type dari Combo ke Bar Chart untuk Sales Order Fulfillment
- [ ] Update Monthly Sales Comparison dari YoY ke MoM comparison
- [ ] Update label dari "current_year_revenue/previous_year_revenue" ke "revenue/previous_month_revenue"
- [ ] Update growth label dari "yoy_growth" ke "mom_growth"
- [ ] Handle null values untuk bulan pertama (previous_month_revenue dan mom_growth)

---

## Contact
Untuk pertanyaan atau issue, hubungi tim backend development.

**Last Updated**: November 10, 2025
