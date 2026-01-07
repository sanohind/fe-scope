# Sales Dashboard Global Filter - Implementation Guide

## 📋 Overview

Global filter telah berhasil diimplementasikan untuk Sales Dashboard dengan parameter:
- **period**: `daily` | `monthly` | `yearly`
- **date_from**: tanggal mulai (format: `YYYY-MM-DD`)
- **date_to**: tanggal akhir (format: `YYYY-MM-DD`)

## ✅ Komponen yang Sudah Diintegrasikan

1. **SalesOverviewKPI** ✅
2. **TopCustomersByRevenue** ✅

## 📝 Cara Mengintegrasikan Filter ke Komponen Lain

Untuk mengintegrasikan global filter ke komponen sales lainnya, ikuti langkah berikut:

### 1. Import `useSalesFilters` Hook

```typescript
import { useSalesFilters } from "../../../context/SalesFilterContext";
```

### 2. Gunakan Hook di Component

```typescript
const YourComponent: React.FC = () => {
  const { requestParams } = useSalesFilters();
  const [data, setData] = useState<YourDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ... rest of your component
};
```

### 3. Update useEffect untuk Menggunakan requestParams

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      // Pass requestParams to API call
      const result = await salesApi.yourApiMethod(requestParams);
      // atau jika ada parameter tambahan:
      // const result = await salesApi.yourApiMethod({ ...requestParams, limit: 10 });
      
      setData(result?.data || result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [requestParams]); // Tambahkan requestParams sebagai dependency
```

## 🔧 Komponen yang Perlu Diintegrasikan

Berikut adalah daftar komponen yang perlu diupdate untuk menggunakan global filter:

### Priority 1 (High Impact)
- [ ] **SalesByProductType** - Chart 4.4
- [ ] **OrderFulfillment** - Chart 4.8
- [ ] **MonthlySalesComparison** - Chart 4.11

### Priority 2 (Medium Impact)
- [ ] **RevenueTrend** - Chart 4.2
- [ ] **TopSellingProducts** - Chart 4.9
- [ ] **RevenueByCurrency** - Chart 4.10

### Priority 3 (Low Impact - Optional)
- [ ] **ShipmentStatusTracking** - Chart 4.5
- [ ] **DeliveryPerformance** - Chart 4.6
- [ ] **InvoiceStatusDistribution** - Chart 4.7

## 📖 Contoh Implementasi Lengkap

### Contoh: SalesByProductType.tsx

```typescript
import React, { useEffect, useState } from "react";
import { salesApi } from "../../../services/api/dashboardApi";
import { useSalesFilters } from "../../../context/SalesFilterContext";

const SalesByProductType: React.FC = () => {
  const { requestParams } = useSalesFilters();
  const [data, setData] = useState<ProductTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await salesApi.getSalesByProductType(requestParams);
        setData(result?.data || result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestParams]);

  // ... rest of component (loading, error, and render logic)
};
```

## 🎯 Parameter API yang Tersedia

Berdasarkan dokumentasi `DASHBOARD4_FILTER_GUIDE.md`, berikut adalah parameter yang didukung oleh setiap endpoint:

| Endpoint | `period` | `date_from`/`date_to` | `customer` | `product_type` | `limit` |
|----------|----------|----------------------|------------|----------------|---------|
| `/overview-kpi` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/revenue-trend` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/top-customers-by-revenue` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/by-product-type` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/shipment-status-tracking` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/delivery-performance` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/invoice-status-distribution` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/order-fulfillment` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/top-selling-products` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/revenue-by-currency` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/monthly-sales-comparison` | ✅ | ✅ | ✅ | ✅ | ❌ |

## 🚀 Testing

Setelah mengintegrasikan filter ke komponen:

1. Buka Sales Dashboard
2. Ubah period (Daily/Monthly/Yearly)
3. Ubah date range menggunakan dropdown
4. Verifikasi bahwa data di chart berubah sesuai filter
5. Check console log untuk melihat `requestParams` yang dikirim

## 📁 File yang Telah Dibuat/Dimodifikasi

### Baru Dibuat:
- `src/context/SalesFilterContext.tsx` - Context untuk global filter
- `src/components/dashboard/sales/SalesFilterHeader.tsx` - UI component untuk filter

### Dimodifikasi:
- `src/pages/MainPages/SalesDashboard.tsx` - Integrasi FilterProvider
- `src/components/dashboard/sales/index.ts` - Export SalesFilterHeader
- `src/services/api/dashboardApi.ts` - Update semua salesApi methods
- `src/components/dashboard/sales/SalesOverviewKPI.tsx` - Contoh implementasi
- `src/components/dashboard/sales/TopCustomersByRevenue.tsx` - Contoh implementasi

## 💡 Tips

1. **Selalu gunakan `cleanParams`** di API calls untuk menghindari parameter undefined
2. **Tambahkan `requestParams` ke dependency array** di useEffect
3. **Handle loading state** dengan baik saat filter berubah
4. **Test dengan berbagai kombinasi** period dan date range

## 🔗 Referensi

- API Documentation: `Document/DASHBOARD4_FILTER_GUIDE.md`
- Production Dashboard Example: `src/pages/MainPages/Production/ProductionDashboard.tsx`
- Production Filter Context: `src/context/ProductionFilterContext.tsx`
