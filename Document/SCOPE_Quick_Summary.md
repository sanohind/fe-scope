# SCOPE System - Quick Summary

## 🎯 Apa itu SCOPE?

**SCOPE (Sanoh Comprehensive Operations Platform for Enterprise)** adalah sistem dashboard multi-departemen untuk monitoring operasional Sanoh Indonesia secara real-time.

---

## 👥 6 User Roles

| # | Role | Access |
|---|------|--------|
| 1 | **Superadmin** | Semua Dashboard (Full Access) |
| 2 | **Warehouse Employee** | Inventory + Warehouse Movement |
| 3 | **Logistics Employee** | Logistics Dashboard |
| 4 | **Finance Employee** | Sales Dashboard |
| 5 | **HR Employee** | HR Dashboard |
| 6 | **Planning Employee** | Planning Manage Pages |

---

## 📊 7 Dashboard Modules

### 1️⃣ Inventory Management (7 pages)
**Akses**: Superadmin, Warehouse Employee  
**Data**: Stock levels, availability, movement  
**Pages**: All RM, All FG, WHRM01, WHRM02, WHFG01, WHFG02, WHMT01

### 2️⃣ Warehouse Operations (7 pages)
**Akses**: Superadmin, Warehouse Employee  
**Data**: Order flow, delivery performance, movement tracking  
**Pages**: All RM, All FG, WHRM01, WHRM02, WHFG01, WHFG02, WHMT01

### 3️⃣ Production Planning (6 pages)
**Akses**: Superadmin  
**Data**: Production orders, status, performance  
**Pages**: Production Dashboard, BZ, CH, NL, PS, SC

### 4️⃣ Sales & Shipment (1 page)
**Akses**: Superadmin, Finance Employee  
**Data**: Revenue, customers, products, fulfillment  
**Page**: Sales Dashboard

### 5️⃣ Logistics (1 page)
**Akses**: Superadmin, Logistics Employee  
**Data**: Shipment analytics, performance, status  
**Page**: Logistics Dashboard

### 6️⃣ HR Management (1 page)
**Akses**: Superadmin, HR Employee  
**Data**: Attendance, overtime, employee metrics  
**Page**: HR Dashboard

### 7️⃣ Planning Manage (4 pages)
**Akses**: Superadmin, Planning Employee  
**Data**: Daily use, production planning  
**Pages**: Daily Use Upload/Manage, Production Plan Upload/Manage

---

## 🔐 Authentication Flow

```
User → SPHERE Portal (Login) → SSO Token → SCOPE System → Role Check → Dashboard
```

**SSO Provider**: SPHERE (Superapp Portal)  
**Auth Method**: JWT Token (Planned)  
**Current Status**: 🚧 In Development

---

## 💾 Data Sources

| Table/View | Purpose | Used By |
|------------|---------|---------|
| `stockbywh` | Stock inventory | Inventory |
| `view_warehouse_order` | Warehouse orders | Warehouse |
| `view_prod_header` | Production orders | Production |
| `so_invoice_line` | Sales & invoices | Sales |
| HR Tables | Employee data | HR |
| Logistics Tables | Shipment data | Logistics |

---

## 🛠️ Technology Stack

**Frontend**:
- React 19 + TypeScript
- Vite (Build Tool)
- Tailwind CSS v4
- ApexCharts
- React Router v6

**Backend** (Planned):
- REST API
- MySQL/PostgreSQL
- JWT Authentication

**Integration**:
- SPHERE Portal (SSO)

---

## 📈 Key Features

✅ **Real-time Monitoring**: Data dan metrics real-time  
✅ **Role-Based Access**: Akses sesuai role user  
✅ **Interactive Charts**: Visualisasi data dengan ApexCharts  
✅ **Multi-Dashboard**: 7 modul dashboard berbeda  
✅ **SSO Integration**: Single Sign-On dengan SPHERE  
✅ **Responsive Design**: Optimized untuk berbagai device  
✅ **Export Capability**: Export data ke Excel/PDF (Planned)

---

## 📊 Dashboard Statistics

- **Total Pages**: 27 pages
- **Total Modules**: 7 modules
- **Total User Roles**: 6 roles
- **Total Charts**: 80+ charts (planned)
- **Warehouses Covered**: 5 warehouses (WHRM01, WHRM02, WHFG01, WHFG02, WHMT01)
- **Production Divisions**: 5 divisions (BZ, CH, NL, PS, SC)

---

## 🎯 Use Cases by Role

### Superadmin
- Monitor semua operasional perusahaan
- Akses semua dashboard dan reports
- Manage planning dan production

### Warehouse Employee
- Monitor stock levels dan inventory
- Track warehouse movements
- Check stock availability

### Logistics Employee
- Monitor shipment status
- Track delivery performance
- Analyze logistics metrics

### Finance Employee
- Monitor sales performance
- Analyze revenue trends
- Track customer orders

### HR Employee
- Monitor attendance
- Track overtime
- Analyze employee metrics

### Planning Employee
- Upload daily use data
- Manage production plans
- Update planning schedules

---

## 🚀 Development Status

| Phase | Status | Description |
|-------|--------|-------------|
| Frontend Dashboard | ✅ Complete | All 27 pages implemented |
| Data Visualization | ✅ Complete | Charts and analytics ready |
| Authentication | 🚧 In Progress | SSO integration with SPHERE |
| Backend API | 📋 Planned | REST API development |
| Role-Based Access | 📋 Planned | Implement access control |
| Export Features | 📋 Planned | Excel/PDF export |

---

## 📞 Quick Links

- **Full Analysis**: [SCOPE_System_Analysis.md](./SCOPE_System_Analysis.md)
- **Flowchart**: [SCOPE_System_Flowchart.md](./SCOPE_System_Flowchart.md)
- **Use Case Diagram**: [SCOPE_Use_Case_Diagram.puml](./SCOPE_Use_Case_Diagram.puml)
- **Chart Specifications**: [Chart-Plan.md](../Chart-Plan.md)

---

**Version**: 1.0  
**Last Updated**: 2025-12-30  
**Status**: ✅ Documentation Complete | 🚧 System In Development
