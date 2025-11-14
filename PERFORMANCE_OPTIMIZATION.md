# Dashboard Performance Optimization

## Masalah Sebelumnya

Sistem mengalami loading yang **sangat lambat** dengan karakteristik:

1. **Route Level**: Semua dashboard pages di-import langsung saat aplikasi pertama dimuat
2. **Component Level**: Semua komponen dashboard di-render sekaligus saat membuka page
3. **API Level**: Semua API calls terpicu bersamaan saat mount

### Contoh: Procurement Dashboard
Ketika user membuka `/procurement`:
- ❌ **11 komponen** di-render sekaligus
- ❌ **11 API calls** terpicu bersamaan
- ❌ Semua data di-fetch meskipun user belum scroll ke bawah
- ❌ Bundle size besar karena semua dashboard di-load di awal

## Solusi yang Diimplementasikan

### 1. Route-Level Lazy Loading (`App.tsx`)

**Sebelum:**
```tsx
import WarehouseDashboard from "./pages/MainPages/WarehouseDashboard";
import InventoryDashboard from "./pages/MainPages/InventoryDashboard";
// dst...

<Route path="/warehouse" element={<WarehouseDashboard />} />
```

**Sesudah:**
```tsx
const WarehouseDashboard = lazy(() => import("./pages/MainPages/WarehouseDashboard"));
// Dashboard di-load hanya saat user mengakses route tersebut

<Route path="/warehouse" element={
  <Suspense fallback={<DashboardLoading />}>
    <WarehouseDashboard />
  </Suspense>
} />
```

**Benefit:**
- ✅ Reduced initial bundle size
- ✅ Faster initial page load
- ✅ Dashboard code di-load on-demand

### 2. Component-Level Lazy Loading (Intersection Observer)

**Component Baru: `LazyLoad.tsx`**
- Menggunakan **Intersection Observer API**
- Component hanya di-render ketika **masuk viewport** (atau 100px sebelumnya)
- Mencegah rendering dan API calls yang tidak perlu

**Cara Kerja:**
```tsx
<LazyLoad height="400px">
  <TopSuppliersByValue />  {/* Hanya load saat visible */}
</LazyLoad>
```

**Sebelum:**
```tsx
<div className="space-y-6">
  <ProcurementKPI />              // API call 1
  <ReceiptPerformance />          // API call 2
  <TopSuppliersByValue />         // API call 3
  <ReceiptTrend />                // API call 4
  // ... 7 komponen lagi (API call 5-11)
</div>
// TOTAL: 11 API calls sekaligus! 🔥
```

**Sesudah:**
```tsx
<div className="space-y-6">
  <ProcurementKPI />              // API call 1 - Load immediately
  
  <LazyLoad height="350px">
    <ReceiptPerformance />        // API call 2 - Load saat visible
  </LazyLoad>
  
  <LazyLoad height="400px">
    <TopSuppliersByValue />       // API call 3 - Load saat visible
  </LazyLoad>
  
  <LazyLoad height="450px">
    <ReceiptTrend />              // API call 4 - Load saat visible
  </LazyLoad>
  // ... dst (partial loading)
</div>
// TOTAL: 1-2 API calls awal, sisanya on-demand! ✅
```

## Perubahan pada Dashboard Pages

### 1. ✅ ProcurementDashboard
- 11 komponen → 10 wrapped dengan LazyLoad
- KPI Cards tetap load langsung (above the fold)

### 2. ✅ InventoryDashboard
- 7 komponen → 6 wrapped dengan LazyLoad
- Stock Level Overview tetap load langsung

### 3. ✅ SalesDashboard
- 11 komponen → 10 wrapped dengan LazyLoad
- Sales Overview KPI tetap load langsung

### 4. ✅ ProductionDashboard
- 7 komponen → 6 wrapped dengan LazyLoad
- Production KPI Summary tetap load langsung

### 5. ✅ WarehouseDashboard
- 7 komponen → 6 wrapped dengan LazyLoad
- Warehouse Order Summary tetap load langsung

## Peningkatan Performa yang Diharapkan

### Initial Load
- ✅ **Bundle size berkurang** ~30-40% (route-level lazy loading)
- ✅ **Initial render lebih cepat** - hanya KPI cards yang di-render
- ✅ **Time to Interactive (TTI) lebih cepat**

### Dashboard Page Load
- ✅ **1-2 API calls awal** vs 7-11 API calls sebelumnya
- ✅ **Progressive loading** - data muncul bertahap saat scroll
- ✅ **Reduced memory usage** - komponen di-render on-demand

### User Experience
- ✅ **Faster perceived performance** - user langsung lihat KPI cards
- ✅ **Smooth scrolling** - komponen load saat di-scroll
- ✅ **Loading state yang jelas** - skeleton loading untuk setiap komponen

## Konfigurasi LazyLoad

### Parameter
```tsx
interface LazyLoadProps {
  children: React.ReactNode;
  height?: string;           // Default: "300px" - untuk reserve space
  fallback?: React.ReactNode; // Custom loading component
  rootMargin?: string;       // Default: "100px" - preload sebelum visible
}
```

### Tips Penggunaan
1. **KPI Cards** - Jangan wrap dengan LazyLoad (above the fold)
2. **Charts/Tables** - Wrap dengan LazyLoad dengan height sesuai
3. **rootMargin: "100px"** - Load 100px sebelum masuk viewport untuk smooth UX
4. Sesuaikan `height` dengan approximate tinggi komponen untuk avoid layout shift

## Testing & Monitoring

### Cara Test
1. Buka Chrome DevTools → Network tab
2. Clear cache dan reload page
3. Observe:
   - Initial bundle size berkurang
   - API calls hanya terpicu saat scroll
   - Lighthouse score meningkat

### Metrics to Monitor
- **Initial Bundle Size** (KB)
- **Time to First Contentful Paint** (FCP)
- **Time to Interactive** (TTI)
- **Number of API Calls on Initial Load**
- **Lighthouse Performance Score**

## Future Improvements

1. **API Response Caching** - Cache API responses untuk reduce duplicate calls
2. **Data Prefetching** - Prefetch data untuk next section saat idle
3. **Virtual Scrolling** - Untuk table dengan banyak rows
4. **Progressive Image Loading** - Lazy load images dalam charts
5. **Service Worker** - Cache assets dan API responses

## Catatan Teknis

- Intersection Observer support: 97%+ browsers (IE11 memerlukan polyfill)
- React.lazy() support: React 16.6+
- Suspense support: React 16.6+ (SSR support di React 18+)

## Dokumentasi Terkait

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React.lazy()](https://react.dev/reference/react/lazy)
- [Code-Splitting](https://react.dev/learn/code-splitting)
