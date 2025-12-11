# Daily Use WH API Documentation

## Base URL

```
/api/daily-use-wh
```

---

## Endpoints

### 1. Import Data from File

**Endpoint:** `POST /import`

**Description:** Import daily use data from an Excel or CSV file. If a record with the same `partno` and `plan_date` exists, it will be updated instead of inserted.

**Request:**

-   **Content-Type:** `multipart/form-data`
-   **Parameters:**
    -   `file` (required): Excel (.xlsx, .xls) or CSV file

**File Format Requirements:**

-   Header row with columns: `partno`, `daily_use`, `plan_date`
-   `partno`: Part number (string)
-   `daily_use`: Daily usage quantity (integer)
-   `plan_date`: Date in format DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD

**Response:**

```json
{
    "success": true,
    "data": {
        "inserted": 10,
        "updated": 5
    },
    "message": "Import berhasil"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/daily-use-wh/import \
  -F "file=@data.xlsx"
```

---

### 2. Create/Store Records via API

**Endpoint:** `POST /store`

**Description:** Create new daily use records via JSON body. If a record with the same `partno` and `plan_date` exists, it will be updated instead of inserted.

**Request:**

-   **Content-Type:** `application/json`
-   **Body:**

```json
{
    "data": [
        {
            "partno": "PART001",
            "daily_use": 100,
            "plan_date": "2024-12-11"
        },
        {
            "partno": "PART002",
            "daily_use": 50,
            "plan_date": "2024-12-11"
        }
    ]
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "inserted": 1,
        "updated": 1
    },
    "message": "Data berhasil disimpan"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/daily-use-wh/store \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "partno": "PART001",
        "daily_use": 100,
        "plan_date": "2024-12-11"
      }
    ]
  }'
```

---

### 3. Get All Records

**Endpoint:** `GET /`

**Description:** Retrieve all daily use records with optional filters and pagination.

**Query Parameters:**

-   `plan_date` (optional): Filter by specific date (format: YYYY-MM-DD)
-   `partno` (optional): Filter by part number
-   `per_page` (optional): Records per page (default: 50, max: 100, min: 10)

**Response:**

```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "partno": "PART001",
                "daily_use": 100,
                "plan_date": "2024-12-11",
                "created_at": "2024-12-11T10:00:00Z",
                "updated_at": "2024-12-11T10:00:00Z"
            }
        ],
        "per_page": 50,
        "total": 100
    },
    "message": "Data berhasil diambil"
}
```

**Example cURL:**

```bash
curl "http://localhost:8000/api/daily-use-wh?plan_date=2024-12-11&per_page=20"
```

---

### 4. Get Single Record

**Endpoint:** `GET /{id}`

**Description:** Retrieve a specific record by ID.

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "partno": "PART001",
        "daily_use": 100,
        "plan_date": "2024-12-11",
        "created_at": "2024-12-11T10:00:00Z",
        "updated_at": "2024-12-11T10:00:00Z"
    },
    "message": "Data berhasil diambil"
}
```

**Example cURL:**

```bash
curl http://localhost:8000/api/daily-use-wh/1
```

---

### 5. Update Record

**Endpoint:** `PUT /{id}`

**Description:** Update a specific record. Supports partial updates (only send fields you want to change).

**Request:**

-   **Content-Type:** `application/json`
-   **Body (all fields optional):**

```json
{
    "partno": "PART001",
    "daily_use": 150,
    "plan_date": "2024-12-12"
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "partno": "PART001",
        "daily_use": 150,
        "plan_date": "2024-12-12",
        "created_at": "2024-12-11T10:00:00Z",
        "updated_at": "2024-12-11T11:00:00Z"
    },
    "message": "Data berhasil diupdate"
}
```

**Example cURL:**

```bash
curl -X PUT http://localhost:8000/api/daily-use-wh/1 \
  -H "Content-Type: application/json" \
  -d '{
    "daily_use": 150
  }'
```

---

### 6. Delete Single Record

**Endpoint:** `DELETE /{id}`

**Description:** Delete a specific record by ID.

**Response:**

```json
{
    "success": true,
    "data": [],
    "message": "Data berhasil dihapus"
}
```

**Example cURL:**

```bash
curl -X DELETE http://localhost:8000/api/daily-use-wh/1
```

---

### 7. Delete Multiple Records

**Endpoint:** `POST /delete-multiple`

**Description:** Delete multiple records by providing an array of IDs.

**Request:**

-   **Content-Type:** `application/json`
-   **Body:**

```json
{
    "ids": [1, 2, 3, 4, 5]
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "deleted": 5
    },
    "message": "Data berhasil dihapus"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:8000/api/daily-use-wh/delete-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [1, 2, 3]
  }'
```

---

## Error Responses

All error responses follow this format:

```json
{
    "success": false,
    "data": [],
    "message": "Error message here"
}
```

### Common Error Codes:

-   **422:** Validation error (missing required fields, invalid format)
-   **404:** Record not found
-   **500:** Server error

**Example Error Response:**

```json
{
    "success": false,
    "data": {
        "file": ["File kosong"]
    },
    "message": "File kosong"
}
```

---

## Key Features

### Duplicate Handling

When importing or storing data:

-   If a record with the same `partno` AND `plan_date` already exists, the `daily_use` value will be **updated** instead of creating a duplicate
-   Response will show both `inserted` and `updated` counts

### Date Format Support

The API accepts multiple date formats:

-   `YYYY-MM-DD` (ISO format)
-   `DD/MM/YYYY` (European format)
-   `DD-MM-YYYY` (European format with dashes)
-   Excel numeric format (automatically converted)

### Pagination

-   Default: 50 records per page
-   Minimum: 10 records per page
-   Maximum: 100 records per page
-   Results are ordered by `plan_date` (descending) then `partno` (ascending)

---

## Notes

-   All timestamps are in UTC format
-   Partial updates are supported on the `PUT` endpoint
-   File imports support both `.xlsx`, `.xls`, and `.csv` formats
-   All operations are wrapped in database transactions for data integrity
