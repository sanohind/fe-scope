# Asakai Board Feature

## Overview
Asakai Board adalah fitur untuk monitoring dan mengelola data Safety, Quality, dan Delivery metrics dalam aplikasi SCOPE.

## Struktur File

### API Service
- **`src/services/asakaiApi.ts`** - API service untuk komunikasi dengan backend Asakai

### Context & Filters
- **`src/context/AsakaiFilterContext.tsx`** - Global filter context untuk period, date range, dan section
- **`src/components/dashboard/asakai/AsakaiFilterHeader.tsx`** - Filter header component

### Components
- **`src/components/dashboard/asakai/AsakaiChartLine.tsx`** - Line chart component untuk menampilkan data Asakai

### Pages
- **`src/pages/MainPages/Asakai/asakai-board.tsx`** - Main dashboard dengan 13 charts
- **`src/pages/MainPages/Asakai/asakai-manage.tsx`** - Page untuk manage chart data (CRUD)
- **`src/pages/MainPages/Asakai/asakai-manage-reasons.tsx`** - Page untuk manage reason data (CRUD)

## Features

### 1. Asakai Board Dashboard (`/asakai-board`)
- Menampilkan 13 charts yang dikelompokkan berdasarkan kategori:
  - **Safety** (2 charts): Fatal Accident, LOST Working Day
  - **Quality** (6 charts): Customer Claim, Warranty Claim, Service Part, Export Part, Local Supplier, Overseas Supplier
  - **Delivery** (5 charts): Shortage, Miss Part, Line Stop, On Time Delivery, Criple
- Global filters: Period (Daily/Monthly/Yearly), Date Range, Section
- Line charts dengan color coding berdasarkan kategori:
  - Safety: Red (#F04438)
  - Quality: Orange (#F79009)
  - Delivery: Green (#12B76A)

### 2. Manage Charts (`/asakai-manage`)
- CRUD operations untuk chart data
- Filter by title dan search by date
- Table view dengan informasi:
  - Title, Category, Date, Quantity, User, Reasons count
- Actions:
  - View/Manage Reasons (Eye icon)
  - Edit Chart (Edit icon)
  - Delete Chart (Trash icon)
- Modal form untuk create/edit chart data

### 3. Manage Reasons (`/asakai-manage-reasons/:chartId`)
- CRUD operations untuk reason data
- Accessible dari Manage Charts page dengan klik icon Eye
- Table view dengan informasi lengkap:
  - Part No, Part Name, Problem, Qty, Section, Line, Penyebab, Perbaikan
- Modal form untuk create/edit reason data
- Back button untuk kembali ke Manage Charts

## API Endpoints Used

### Titles
- `GET /api/asakai/titles` - Get all titles
- `GET /api/asakai/titles/{id}` - Get title by ID

### Charts
- `GET /api/asakai/charts` - Get all charts (with filters)
- `GET /api/asakai/charts/{id}` - Get chart by ID (with reasons)
- `POST /api/asakai/charts` - Create chart
- `PUT /api/asakai/charts/{id}` - Update chart
- `DELETE /api/asakai/charts/{id}` - Delete chart

### Reasons
- `GET /api/asakai/reasons` - Get all reasons (with filters)
- `GET /api/asakai/reasons/{id}` - Get reason by ID
- `POST /api/asakai/reasons` - Create reason
- `PUT /api/asakai/reasons/{id}` - Update reason
- `DELETE /api/asakai/reasons/{id}` - Delete reason
- `GET /api/asakai/charts/{chartId}/reasons` - Get reasons by chart ID

## Navigation
Menu "Asakai Board" ditambahkan di posisi paling atas sidebar dengan 2 sub-menu:
1. Dashboard - Link ke `/asakai-board`
2. Manage Charts - Link ke `/asakai-manage`

## Design Pattern
- **OOP Structure**: Mengikuti pattern dari `nlProd.tsx` dengan Provider/Consumer pattern
- **Global Filters**: Context-based filtering seperti ProductionFilterContext
- **Chart Component**: Mengikuti pattern dari `DailyStockTrend.tsx`
- **Lazy Loading**: Menggunakan LazyLoad component untuk optimasi performa

## Color Scheme
- **Safety**: Red (#F04438)
- **Quality**: Orange (#F79009)
- **Delivery**: Green (#12B76A)
- **Default/Brand**: Blue (#465fff)
