# Ticket Management System API

Sistem manajemen tiket berbasis Express.js dengan fitur manajemen kategori, prioritas, status, SLA, pengguna, dan lampiran file.

## 📋 Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Struktur Proyek](#struktur-proyek)
- [API Routes](#api-routes)
- [Controllers](#controllers)
- [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
- [Contoh Penggunaan](#contoh-penggunaan)

---

## Gambaran Umum

Sistem ini menyediakan REST API lengkap untuk mengelola tiket support dengan fitur-fitur:

- **User Management**: Autentikasi, registrasi, dan manajemen pengguna dengan role berbeda
- **Ticket Management**: Pembuatan, pembaruan, dan penugasan tiket
- **Category & Priority**: Manajemen kategori tiket dan tingkat prioritas
- **SLA Management**: Sistem Service Level Agreement dengan response dan resolution time
- **Comments**: Sistem komentar untuk setiap tiket
- **File Attachments**: Upload dan download file lampiran
- **Audit Logging**: Pencatatan perubahan tiket dan SLA

---

## Struktur Proyek

```
project/
├── routes/
│   ├── attachment_routes.js
│   ├── auth_check_routes.js
│   ├── category_routes.js
│   ├── comment_routes.js
│   ├── priority_routes.js
│   ├── role_routes.js
│   ├── sla_routes.js
│   ├── status_routes.js
│   ├── ticket_routes.js
│   └── user_routes.js
├── controller/
│   ├── attachment_controller.js
│   ├── category_controller.js
│   ├── comment_controller.js
│   ├── priority_controller.js
│   ├── role_controller.js
│   ├── sla_controller.js
│   ├── status_controller.js
│   ├── ticket_controller.js
│   └── user_controller.js
├── middleware/
│   ├── auth_midleware.js
│   ├── query_params_middleware.js
│   └── ticket_query_params_middleware.js
├── validators/
│   ├── comment_validator.js
│   ├── mandatory_validator.js
│   ├── sla_validation.js
│   ├── ticket_validation.js
│   └── user_validators.js
├── models/
│   └── index.js
└── uploads/
    └── (file uploads directory)
```

---

## API Routes

### 1. User Routes (`/api/users`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/users` | ✓ | Dapatkan semua pengguna dengan pagination |
| GET | `/users/:id` | ✗ | Dapatkan pengguna berdasarkan ID |
| GET | `/customer` | ✗ | Dapatkan semua customer (role_id: 3) |
| GET | `/agent` | ✗ | Dapatkan semua agent (role_id: 2) |
| GET | `/member` | ✗ | Dapatkan semua member (bukan customer) |
| POST | `/login` | ✗ | Login pengguna |
| POST | `/register` | ✗ | Registrasi pengguna baru |
| PUT | `/users/:id` | ✗ | Update data pengguna |
| DELETE | `/users/:id` | ✗ | Hapus pengguna |

**Query Parameters untuk GET /users:**
- `limit`: Jumlah hasil per halaman (default: 10)
- `offset`: Offset untuk pagination
- `sort`: Field untuk sorting (default: id)
- `order`: ASC atau DESC
- `search`: Cari berdasarkan nama atau email

**Contoh Request Login:**
```json
POST /login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Login:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role_id": 1,
      "role": { "id": 1, "role_name": "Admin" }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2. Ticket Routes (`/api/ticket`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/ticket` | ✓ | Dapatkan semua tiket dengan filter |
| GET | `/ticket/:id` | ✓ | Dapatkan detail tiket lengkap |
| POST | `/ticket` | ✓ | Buat tiket baru |
| PUT | `/ticket/:id` | ✓ | Update tiket |
| PUT | `/assign/:id` | ✓ | Tetapkan tiket ke agent |

**Query Parameters untuk GET /ticket:**
- `search`: Cari berdasarkan subject
- `category`: Filter berdasarkan kategori
- `priority`: Filter berdasarkan prioritas
- `status`: Filter berdasarkan status
- `sort`: Field untuk sorting
- `order`: ASC atau DESC

**Contoh Request Buat Tiket:**
```json
POST /ticket
{
  "subject": "Database connection error",
  "user_id": 3,
  "agent_id": 2,
  "category_id": 1,
  "priority_id": 2,
  "status_id": 1,
  "comment": "System cannot connect to database"
}
```

**Response Detail Tiket:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "subject": "Database connection error",
    "user": { "id": 3, "first_name": "Jane", "last_name": "Smith" },
    "agent": { "id": 2, "first_name": "John", "last_name": "Support" },
    "category": { "id": 1, "name": "Technical" },
    "priority": { "id": 2, "name": "High", "color": "#FF5733" },
    "status": { "id": 1, "name": "Open", "color": "#3498DB" },
    "sla": { "id": 1, "sla_name": "Priority High", "response_time": 3600, "resolution_time": 86400 },
    "comments": [ { "id": 1, "message": "Investigating...", "user": {...} } ],
    "attachments": [ { "id": 1, "file_url": "file-123.pdf" } ],
    "logs": [ { "action": "Created", "changed_by": 1 } ]
  }
}
```

---

### 3. Category Routes (`/api/category`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/category` | ✗ | Dapatkan semua kategori |
| GET | `/category/:id` | ✗ | Dapatkan detail kategori |
| GET | `/category-by-sla` | ✗ | Dapatkan kategori dengan SLA |
| POST | `/category` | ✗ | Buat kategori baru |
| POST | `/category-sla` | ✗ | Buat kategori dengan SLA |
| PUT | `/category/:id` | ✗ | Update kategori |
| PUT | `/category-sla/:id` | ✗ | Update kategori dengan SLA |
| DELETE | `/category/:id` | ✗ | Hapus kategori |

**Contoh Request Buat Kategori dengan SLA:**
```json
POST /category-sla
{
  "name": "Technical Support",
  "slas": [
    {
      "priority_id": 1,
      "response_time": 3600,
      "resolution_time": 86400
    },
    {
      "priority_id": 2,
      "response_time": 1800,
      "resolution_time": 43200
    }
  ]
}
```

---

### 4. Priority Routes (`/api/priority`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/priority` | ✗ | Dapatkan semua prioritas |
| GET | `/priority/:id` | ✗ | Dapatkan prioritas berdasarkan ID |
| POST | `/priority` | ✗ | Buat prioritas baru |
| PUT | `/priority/:id` | ✗ | Update prioritas |
| DELETE | `/priority/:id` | ✗ | Hapus prioritas |

**Contoh Request Buat Prioritas:**
```json
POST /priority
{
  "name": "Critical",
  "color": "#E74C3C"
}
```

---

### 5. Status Routes (`/api/status`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/status` | ✗ | Dapatkan semua status |
| GET | `/status/:id` | ✗ | Dapatkan status berdasarkan ID |
| POST | `/status` | ✗ | Buat status baru |
| PUT | `/status/:id` | ✗ | Update status |
| DELETE | `/status/:id` | ✗ | Hapus status |

---

### 6. SLA Routes (`/api/sla`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/sla` | ✗ | Dapatkan semua SLA |
| GET | `/sla/:id` | ✗ | Dapatkan SLA berdasarkan ID |
| POST | `/sla` | ✗ | Buat SLA baru |
| PUT | `/sla/:id` | ✗ | Update SLA |

**Contoh Request Buat SLA:**
```json
POST /sla
{
  "sla_name": "Premium Support",
  "description": "24/7 support with 1 hour response time",
  "response_time": 3600,
  "resolution_time": 86400,
  "category_id": 1,
  "priority_id": 1
}
```

---

### 7. Comment Routes (`/api/comment`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/comment` | ✓ | Dapatkan semua komentar |
| POST | `/comment` | ✓ | Buat komentar baru |

**Contoh Request Buat Komentar:**
```json
POST /comment
{
  "message": "Issue has been resolved",
  "ticket_id": 1
}
```

---

### 8. Attachment Routes (`/api/attachment`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/file-upload` | ✗ | Upload file attachment |
| GET | `/file/:ticket_id` | ✗ | Dapatkan attachment tiket |
| GET | `/download/:filename` | ✗ | Download file |

**File Upload Configuration:**
- **Max Size**: 10MB
- **Allowed Types**: jpeg, jpg, png, gif, pdf, doc, docx, txt
- **Storage**: Folder `uploads/`

**Contoh Request Upload:**
```
POST /file-upload
Content-Type: multipart/form-data

file: <binary file>
ticket_id: 1
last_comment: "Document attached"
```

---

### 9. Auth Routes (`/api/auth-check`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/auth-check` | ✓ | Validasi token autentikasi |

---

### 10. Role Routes (`/api/role`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/role` | ✗ | Dapatkan semua role |

**Role Default:**
- `1`: Admin
- `2`: Agent
- `3`: Customer

---

## Controllers

### User Controller

**Fungsi Utama:**
- `getAllUser()`: Mendapatkan semua pengguna dengan filter dan pagination
- `getUserById()`: Mendapatkan pengguna spesifik
- `getAllCustomer()`: Mendapatkan semua customer
- `getAllAgent()`: Mendapatkan semua agent
- `getAllMember()`: Mendapatkan semua member
- `loginUser()`: Autentikasi pengguna dan generate JWT token
- `createUser()`: Registrasi pengguna baru
- `updateUser()`: Memperbarui data pengguna
- `deleteUser()`: Menghapus pengguna

**Security Features:**
- Password hashing (tidak pernah dikembalikan dalam response)
- JWT token generation (2 hari ekspirasi)
- Validasi email unik
- Role-based access control

---

### Ticket Controller

**Fungsi Utama:**
- `getAllTicket()`: Mendapatkan tiket dengan filter berdasarkan role
- `getTicketById()`: Mendapatkan detail tiket lengkap
- `createTicket()`: Membuat tiket baru dengan SLA otomatis
- `updateTicket()`: Memperbarui tiket dan mencatat perubahan
- `assignTicket()`: Menugaskan tiket ke agent

**Role-Based Filtering:**
- Admin: Melihat semua tiket
- Agent: Melihat tiket yang ditugaskan atau belum ditugaskan
- Customer: Hanya melihat tiket miliknya

**Automatic SLA Calculation:**
- Response time dan resolution time dihitung berdasarkan kategori dan prioritas
- Sistem mencatat waktu response dan resolution

---

### Category Controller

**Fungsi Utama:**
- `getAllCategory()`: Mendapatkan semua kategori
- `getCategoryById()`: Mendapatkan kategori dengan SLA
- `createCategory()`: Membuat kategori baru
- `createCategoryWithSla2()`: Membuat kategori dengan SLA menggunakan transaction
- `updateCategory()`: Memperbarui kategori
- `updateCategoryWithSla()`: Memperbarui kategori dan SLA dengan validasi
- `deleteCategory()`: Menghapus kategori

**Validasi:**
- Nama kategori unik
- SLA tidak bisa dihapus jika sedang digunakan di tiket
- Response time < resolution time

---

### Attachment Controller

**Fungsi Utama:**
- `uploadAttachment()`: Upload file dengan validasi tipe
- `getAttachments()`: Mendapatkan file dari tiket tertentu
- `downloadFile()`: Download file dengan content-type yang tepat

**File Handling:**
- Automatic directory creation
- Unique filename generation dengan timestamp
- Content-type detection berdasarkan ekstensi

---

### Priority Controller

**Fungsi Utama:**
- `getAllPriority()`: Mendapatkan semua prioritas
- `getPriorityById()`: Mendapatkan prioritas spesifik
- `createPriority()`: Membuat prioritas dengan color code
- `updatePriority()`: Memperbarui prioritas
- `deletePriority()`: Menghapus prioritas (jika tidak digunakan)

---

### Status Controller

**Fungsi Utama:**
- `getAllStatus()`: Mendapatkan semua status
- `getStatusById()`: Mendapatkan status spesifik
- `createStatus()`: Membuat status baru
- `updateStatus()`: Memperbarui status
- `deleteStatus()`: Menghapus status (jika tidak digunakan)

---

### SLA Controller

**Fungsi Utama:**
- `getAllSla()`: Mendapatkan semua SLA dengan relasi
- `getSlaById()`: Mendapatkan SLA spesifik
- `createSla()`: Membuat SLA baru
- `updateSla()`: Memperbarui SLA

---

### Comment Controller

**Fungsi Utama:**
- `getAllComments()`: Mendapatkan semua komentar dengan user info
- `createComment()`: Membuat komentar baru pada tiket

---

### Role Controller

**Fungsi Utama:**
- `getAllRole()`: Mendapatkan semua role yang tersedia

---

## Instalasi dan Konfigurasi

### Prerequisites

- Node.js (v14 atau lebih tinggi)
- Express.js
- Sequelize ORM
- MySQL atau database relasional lainnya

### Installation

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticketing_system
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=3000
NODE_ENV=development

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### Database Setup

```bash
# Run migrations
npm run migrate

# Seed initial data (roles, statuses, priorities)
npm run seed
```

### Starting the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## Contoh Penggunaan

### 1. User Registration dan Login

```bash
# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "secure_password"
  }'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure_password"
  }'
```

### 2. Create Ticket dengan Attachment

```bash
# Step 1: Create ticket
curl -X POST http://localhost:3000/api/ticket \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Application crash on startup",
    "user_id": 3,
    "category_id": 1,
    "priority_id": 1,
    "status_id": 1,
    "comment": "App crashes when launched"
  }'

# Step 2: Upload attachment
curl -X POST http://localhost:3000/api/file-upload \
  -F "file=@error_log.pdf" \
  -F "ticket_id=1" \
  -F "last_comment=Error log attached"
```

### 3. Update Ticket Status dan Assign Agent

```bash
# Assign ticket to agent
curl -X PUT http://localhost:3000/api/assign/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": 2
  }'

# Update ticket status
curl -X PUT http://localhost:3000/api/ticket/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status_id": 3
  }'
```

### 4. Create Category dengan Multiple SLA

```bash
curl -X POST http://localhost:3000/api/category-sla \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Billing Support",
    "slas": [
      {
        "priority_id": 1,
        "response_time": 1800,
        "resolution_time": 14400
      },
      {
        "priority_id": 2,
        "response_time": 3600,
        "resolution_time": 28800
      },
      {
        "priority_id": 3,
        "response_time": 7200,
        "resolution_time": 86400
      }
    ]
  }'
```

---

## Notes Penting

### Security

- ⚠️ Pastikan `authenticateToken` middleware diaktifkan untuk routes yang membutuhkan autentikasi (saat ini commented)
- ⚠️ Jangan pernah commit `.env` file
- ⚠️ Gunakan HTTPS di production
- ⚠️ Implement rate limiting untuk prevent abuse

### Performance

- Implementasi pagination untuk query besar
- Gunakan database indexing pada field yang sering dicari
- Cache data yang jarang berubah

### Validasi & Error Handling

- Semua input harus divalidasi
- Response error konsisten menggunakan format standar
- Implement proper logging untuk debugging

---

## Troubleshooting

**Error: "Ticket not found"**
- Pastikan `ticket_id` valid dan tiket ada di database

**Error: "SLA not found"**
- Pastikan kategori dan prioritas memiliki SLA yang sesuai

**Error: "File type not allowed"**
- Hanya file dengan tipe: jpeg, jpg, png, gif, pdf, doc, docx, txt yang diizinkan

**Error: "Cannot delete category"**
- Kategori sedang digunakan oleh tiket. Hapus semua tiket dengan kategori ini terlebih dahulu

---

## Lisensi

MIT License - Bebas untuk digunakan dalam proyek komersial maupun non-komersial.