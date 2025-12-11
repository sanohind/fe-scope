# Planning Manage - Setup & Implementation Guide

## 📋 Overview

Halaman "Planning Manage" telah berhasil dibuat untuk mengelola data Daily Use Warehouse dengan fitur:

- ✅ Import Excel file dengan drag & drop
- ✅ View data dalam tabel dengan pagination & search
- ✅ Edit data individual
- ✅ Delete single atau multiple records
- ✅ Real-time refresh & notifications

## 🗂️ File Structure

```
src/
├── components/dashboard/planning/
│   ├── PlanningManage.tsx           # Main component
│   ├── FileDropZone.tsx             # Upload component
│   ├── DailyUseWhTable.tsx          # Data table component
│   ├── DailyUseWhEditForm.tsx       # Edit form modal
│   ├── index.ts                     # Exports
│   └── README.md                    # Component documentation
├── services/
│   └── dailyUseWhApi.ts             # API service
├── pages/MainPages/
│   └── PlanningManagePage.tsx       # Page wrapper
└── App.tsx                          # Route added
```

## 🚀 Quick Start

### 1. Access the Page

Navigate to: `http://localhost:5173/#/planning-manage`

Or click "Planning Manage" in the sidebar menu.

### 2. Upload Excel File

1. Click on the upload area or drag & drop an Excel file
2. File must contain columns: `partno`, `daily_use`, `plan_date`
3. Wait for upload to complete
4. Table will auto-refresh with new data

### 3. Manage Data

- **Search**: Filter by Part No or Plan Date
- **Edit**: Click edit icon to modify record
- **Delete**: Click delete icon to remove record
- **Bulk Delete**: Select multiple rows and click "Delete Selected"

## 📊 Excel File Format

### Required Columns

| Column    | Type    | Example    | Notes                |
| --------- | ------- | ---------- | -------------------- |
| partno    | String  | P001       | Part number/SKU      |
| daily_use | Integer | 100        | Daily usage quantity |
| plan_date | Date    | 2025-01-15 | YYYY-MM-DD format    |

### Example Excel File

```
partno    | daily_use | plan_date
----------|-----------|----------
P001      | 100       | 2025-01-15
P002      | 250       | 2025-01-16
P003      | 150       | 2025-01-17
P004      | 200       | 2025-01-18
P005      | 300       | 2025-01-19
```

## 🔌 API Configuration

### Base URL

File: `src/services/dailyUseWhApi.ts` (Line 1)

```typescript
const BASE_URL = "http://127.0.0.1:8000";
```

**Update this if your backend URL is different!**

### API Endpoints Used

```
POST   /api/daily-use-wh/import              # Import Excel
GET    /api/daily-use-wh                     # Get all data
GET    /api/daily-use-wh/{id}                # Get single record
POST   /api/daily-use-wh                     # Create record
PATCH  /api/daily-use-wh/{id}                # Update record
DELETE /api/daily-use-wh/{id}                # Delete record
POST   /api/daily-use-wh/delete-multiple     # Delete multiple
```

## 🎯 Features Detail

### Upload Excel

- Supports: `.xlsx`, `.xls`, `.csv`
- Max file size: 10MB
- Drag & drop or click to select
- Real-time upload status
- Auto-refresh table after success

### Data Table

- **Pagination**: 10, 25, 50, 100 items per page
- **Search**: Part No and Plan Date filters
- **Sorting**: Click column headers (if implemented)
- **Actions**: Edit and Delete buttons per row
- **Bulk Actions**: Select multiple rows for batch delete

### Edit Form

- Modal dialog for add/edit
- Fields: Part No, Daily Use, Plan Date
- Validation: All fields required, Daily Use > 0
- Auto-close after successful save

## 🛠️ Component Props

### PlanningManage

No props required. Standalone component.

```tsx
<PlanningManage />
```

### FileDropZone

```typescript
interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  uploadStatus?: "idle" | "success" | "error";
  errorMessage?: string;
}
```

### DailyUseWhTable

```typescript
interface DailyUseWhTableProps {
  refreshTrigger?: number;
  onEdit?: (data: DailyUseWhData) => void;
  onDelete?: (id: number) => void;
}
```

### DailyUseWhEditForm

```typescript
interface DailyUseWhEditFormProps {
  data?: DailyUseWhData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

## 📝 Data Types

### DailyUseWhData

```typescript
interface DailyUseWhData {
  id?: number;
  partno: string;
  daily_use: number;
  plan_date: string;
  created_at?: string;
  updated_at?: string;
}
```

## 🎨 Styling

- **Framework**: TailwindCSS
- **Icons**: Lucide React
- **Dark Mode**: Fully supported
- **Responsive**: Mobile, tablet, desktop

## 🔧 Configuration Changes Made

### 1. TypeScript Path Alias

File: `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 2. Route Added

File: `src/App.tsx`

```tsx
<Route path="/planning-manage" element={<PlanningManagePage />} />
```

### 3. Sidebar Menu

File: `src/layout/AppSidebar.tsx` (Already configured)

```tsx
{
  icon: <DiamondPlus size={12} />,
  name: "Planning Manage",
  path: "/planning-manage",
}
```

## 🧪 Testing Checklist

- [ ] Navigate to `/planning-manage` page
- [ ] Upload Excel file with valid data
- [ ] Verify data appears in table
- [ ] Search by Part No
- [ ] Filter by Plan Date
- [ ] Edit a record
- [ ] Delete a single record
- [ ] Select multiple records and bulk delete
- [ ] Test pagination
- [ ] Test with different per_page values
- [ ] Test error handling (invalid file, API errors)
- [ ] Test dark mode
- [ ] Test responsive design on mobile

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/services/dailyUseWhApi'"

**Solution**: Make sure `tsconfig.app.json` has the path alias configured.

### Issue: API returns 404 or connection refused

**Solution**: Check if backend is running and BASE_URL is correct in `dailyUseWhApi.ts`.

### Issue: Excel file not uploading

**Solution**:

- Check file format (.xlsx, .xls, or .csv)
- Verify file size < 10MB
- Check browser console for errors

### Issue: Table not refreshing after upload

**Solution**: Check browser console for API errors. Ensure backend returns proper response format.

## 📚 Related Documentation

- **API Guide**: `Document/DAILY_USE_WH_GUIDE.md`
- **Component Docs**: `src/components/dashboard/planning/README.md`
- **Service Docs**: `src/services/dailyUseWhApi.ts` (JSDoc comments)

## 🔐 Security Notes

- File upload validation on frontend (type & size)
- API should validate on backend
- No sensitive data in localStorage
- CSRF protection (if applicable)

## 📈 Future Enhancements

- [ ] Export data to Excel
- [ ] Batch import history
- [ ] Data validation rules
- [ ] Advanced filtering
- [ ] Column customization
- [ ] Data analytics/reports
- [ ] Audit logs
- [ ] Role-based access control

## 📞 Support

For issues or questions:

1. Check the README files in component folders
2. Review API documentation in `DAILY_USE_WH_GUIDE.md`
3. Check browser console for error messages
4. Verify backend API is running and responding correctly

---

**Last Updated**: December 10, 2025
**Status**: ✅ Complete and Ready to Use
