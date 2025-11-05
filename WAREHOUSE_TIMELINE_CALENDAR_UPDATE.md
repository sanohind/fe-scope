# Warehouse Order Timeline - Calendar View Update

## ✅ Perubahan dari Gantt Chart ke Calendar Timeline

### Overview
Komponen **Warehouse Order Timeline** telah diubah dari Google Gantt Chart menjadi FullCalendar timeline view dengan filter per bulan, tetap terhubung dengan API.

---

## 🔄 Perubahan Utama

### 1. **Library Change**
**SEBELUM:**
```typescript
// Google Charts
import { useRef } from "react";
const googleChartsLoaded = useRef(false);
window.google.charts.load('current', { packages: ['gantt'] });
```

**SESUDAH:**
```typescript
// FullCalendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
```

### 2. **Filter System**
**SEBELUM:**
```typescript
// Date range filters
const [dateFrom, setDateFrom] = useState<string>(...);
const [dateTo, setDateTo] = useState<string>(...);
```

**SESUDAH:**
```typescript
// Month & Year filters
const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
```

### 3. **Data Conversion to Calendar Events**
```typescript
const events: EventInput[] = data.map((order) => {
  const statusColors: Record<string, string> = {
    on_time: "Success",    // Green
    delayed: "Danger",     // Red
    pending: "Warning",    // Yellow
    early: "Primary"       // Blue
  };

  return {
    id: order.order_no,
    title: `${order.order_no}`,
    start: order.order_date,
    end: order.actual_receipt_date || order.planned_delivery_date,
    allDay: true,
    extendedProps: {
      calendar: statusColors[order.delivery_status] || "Primary",
      order_data: order
    }
  };
});
```

### 4. **Calendar Configuration**
```typescript
<FullCalendar
  ref={calendarRef}
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  initialDate={new Date(selectedYear, selectedMonth - 1, 1)}
  headerToolbar={{
    left: "title",
    center: "",
    right: ""
  }}
  events={events}
  eventClick={handleEventClick}
  eventContent={renderEventContent}
  height="auto"
  dayMaxEvents={3}
/>
```

### 5. **Auto-Update Calendar View**
```typescript
useEffect(() => {
  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(new Date(selectedYear, selectedMonth - 1, 1));
  }
}, [selectedMonth, selectedYear]);
```

### 6. **Order Detail Modal**
Ditambahkan modal untuk menampilkan detail order ketika event diklik:
```typescript
const handleEventClick = (clickInfo: EventClickArg) => {
  const orderData = clickInfo.event.extendedProps.order_data;
  setSelectedOrder(orderData);
  openModal();
};
```

---

## 📊 Features Implemented

### ✅ Calendar View Features
- [x] Monthly calendar view (dayGridMonth)
- [x] Event coloring by delivery status
- [x] Click event to view order details
- [x] Auto-navigation when month/year changes
- [x] Max 3 events per day (dayMaxEvents)
- [x] Responsive height

### ✅ Filter Features
- [x] **Month selector**: Dropdown dengan 12 bulan
- [x] **Year selector**: 3 tahun terakhir
- [x] **Status filter**: All / On Time / Delayed / Pending
- [x] **Limit filter**: 20 / 50 / 100 orders
- [x] **Reset button**: Kembali ke bulan/tahun saat ini

### ✅ API Integration
- [x] Automatic date range calculation per month
- [x] API call dengan `date_from` & `date_to` dari selected month
- [x] Data akurat berdasarkan tanggal dari API
- [x] Summary statistics tetap ditampilkan

### ✅ Order Details Modal
Menampilkan informasi lengkap:
- Order number & status badge
- Route (ship_from → ship_to)
- Order date, planned delivery, actual receipt
- Order quantity & fulfillment rate
- Duration (planned vs actual)
- Days difference indicator

---

## 🎨 Visual Design

### Calendar Color Coding
```css
/* On Time (Success) - Green */
.fc-bg-success {
  background-color: #10B981;
}

/* Delayed (Danger) - Red */
.fc-bg-danger {
  background-color: #EF4444;
}

/* Pending (Warning) - Yellow */
.fc-bg-warning {
  background-color: #F59E0B;
}

/* Early (Primary) - Blue */
.fc-bg-primary {
  background-color: #465FFF;
}
```

### Modal Design
- Clean, modern layout
- Color-coded status badge
- Grid layout untuk data
- Responsive spacing
- Dark mode support

---

## 📅 Filter UI Layout

```
┌─────────────────────────────────────────────────┐
│  Month Filter  │  Year Filter  │  Status Filter │
│  [November ▼]  │  [2025 ▼]     │  [All Status ▼]│
│                                                   │
│  Limit Filter  │  Reset Button                   │
│  [100 Orders ▼]│  [Reset Filters]               │
└─────────────────────────────────────────────────┘
```

### Responsive Grid
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns
- Large: 5 columns

---

## 🔄 Data Flow

```
User selects Month & Year
    ↓
Calculate date range (firstDay - lastDay)
    ↓
API call: warehouseApi.getOrderTimeline({
  date_from: "2025-11-01",
  date_to: "2025-11-30",
  status: "all",
  limit: 100
})
    ↓
Response: { data: [...], summary: {...} }
    ↓
Convert to calendar events format
    ↓
FullCalendar renders events
    ↓
Calendar auto-navigates to selected month
```

---

## 🎯 API Integration Details

### Date Range Calculation
```typescript
// Calculate date range for selected month
const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
const lastDay = new Date(selectedYear, selectedMonth, 0);

const params = {
  date_from: firstDay.toISOString().split('T')[0],  // "2025-11-01"
  date_to: lastDay.toISOString().split('T')[0],     // "2025-11-30"
  limit: 100
};
```

### Event Mapping
```typescript
API Response Order → Calendar Event
{
  order_no: "TW2503820"           → id: "TW2503820"
  order_date: "2025-11-03"        → start: "2025-11-03"
  actual_receipt_date: "..."      → end: "2025-11-03"
  delivery_status: "on_time"      → calendar: "Success"
  [full order data]               → order_data: {...}
}
```

---

## 💡 Usage Example

### Melihat Timeline Bulan November 2025
1. Select **Month**: November
2. Select **Year**: 2025
3. Calendar otomatis menampilkan November 2025
4. Events muncul berdasarkan order_date

### Melihat Detail Order
1. Klik pada event di calendar
2. Modal muncul dengan detail lengkap
3. Lihat status, route, dates, quantities
4. Close modal untuk kembali

### Filter by Status
1. Select **Status**: Delayed
2. Hanya order "delayed" yang ditampilkan
3. Summary stats update otomatis

---

## 🚀 Advantages of Calendar View

### Dibanding Gantt Chart:

#### **Visual Clarity**
- ✅ Lebih mudah melihat distribusi order per hari
- ✅ Pattern recognition lebih baik (busy days vs quiet days)
- ✅ Color coding lebih jelas terlihat

#### **User Interaction**
- ✅ Click event untuk detail (lebih intuitif)
- ✅ Modal detail terstruktur rapi
- ✅ Navigation per month lebih natural

#### **Performance**
- ✅ Lighter rendering (tidak perlu Google Charts external)
- ✅ Better mobile experience
- ✅ Faster load time

#### **Flexibility**
- ✅ Mudah di-customize styling
- ✅ Support dark mode native
- ✅ Responsive by default

---

## 📝 Component Props & State

### State Variables
```typescript
const [data, setData] = useState<OrderTimelineData[]>([]);
const [summary, setSummary] = useState<TimelineSummary | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
const [selectedStatus, setSelectedStatus] = useState<string>("all");
const [limit, setLimit] = useState<number>(100);
const [selectedOrder, setSelectedOrder] = useState<OrderTimelineData | null>(null);
```

### Refs
```typescript
const calendarRef = useRef<FullCalendar>(null);
```

### Custom Hooks
```typescript
const { isOpen, openModal, closeModal } = useModal();
```

---

## 🎨 Styling Classes Used

### Container
```css
.custom-calendar              /* Calendar wrapper */
.rounded-2xl                  /* Border radius */
.border-gray-200              /* Border color */
.dark:border-gray-800         /* Dark mode border */
```

### Events
```css
.fc-bg-success               /* Green events */
.fc-bg-danger                /* Red events */
.fc-bg-warning               /* Yellow events */
.fc-bg-primary               /* Blue events */
.event-fc-color              /* Event container */
.fc-event-title              /* Event title */
```

### Modal
```css
.max-w-[600px]               /* Modal width */
.space-y-4                   /* Spacing between sections */
.grid-cols-2                 /* Two column grid */
```

---

## ✅ Testing Checklist

### Functionality
- [x] Component renders without errors
- [x] API call works with month filters
- [x] Calendar displays correct month/year
- [x] Events render on correct dates
- [x] Event colors match status
- [x] Click event opens modal
- [x] Modal shows correct order details
- [x] Filter changes update calendar
- [x] Reset button works correctly
- [x] Summary stats calculate properly

### Visual
- [x] Calendar layout responsive
- [x] Event colors visible
- [x] Modal centered and styled
- [x] Dark mode support
- [x] Loading state displays
- [x] Error state displays
- [x] Empty state displays

### Data Accuracy
- [x] Orders appear on correct dates (order_date)
- [x] Event spans show duration correctly
- [x] Status colors match delivery_status
- [x] Modal data matches API response
- [x] Date formatting correct
- [x] Quantity formatting correct

---

## 🐛 Known Considerations

### 1. **Large Number of Orders Per Day**
- **Issue**: If >3 orders per day, shows "+X more" link
- **Solution**: `dayMaxEvents={3}` implemented
- **Alternative**: Increase number or use `dayMaxEvents={true}` for auto

### 2. **Month Navigation**
- **Current**: Navigation controlled by filters only
- **Enhancement**: Could add prev/next buttons on calendar

### 3. **Event Duration Display**
- **Current**: Events span from order_date to receipt_date
- **Visual**: Shows as multi-day bar in calendar
- **Accurate**: Based on actual API dates

---

## 📦 Dependencies Required

Pastikan package.json memiliki:
```json
{
  "dependencies": {
    "@fullcalendar/react": "^6.x.x",
    "@fullcalendar/daygrid": "^6.x.x",
    "@fullcalendar/interaction": "^6.x.x",
    "@fullcalendar/core": "^6.x.x"
  }
}
```

Jika belum install:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/core
```

---

## 🎉 Summary

Komponen **Warehouse Order Timeline** telah berhasil diubah menjadi:

### ✅ From Gantt Chart
- ❌ Google Charts dependency
- ❌ Complex rendering
- ❌ Limited interactivity

### ✅ To Calendar Timeline
- ✅ FullCalendar (lighter, modern)
- ✅ Month-based view dengan filter
- ✅ Interactive event click → modal detail
- ✅ API integration tetap aktif
- ✅ Data akurat per tanggal
- ✅ Color-coded by status
- ✅ Responsive & dark mode ready

### 📊 Key Features
1. **Monthly view** - Tampilan per bulan
2. **Month/Year filter** - Navigasi mudah
3. **Status color coding** - Visual status jelas
4. **Interactive events** - Click untuk detail
5. **Detail modal** - Info lengkap order
6. **API connected** - Real data dari backend
7. **Auto-update view** - Calendar navigasi otomatis

**Status**: ✅ Complete & Production Ready  
**File**: `src/components/dashboard/warehouse/WarehouseOrderTimeline.tsx`  
**Last Updated**: November 3, 2025
