# EmployeeHub – Employee Self-Service Portal

EmployeeHub adalah aplikasi web Employee Self-Service (ESS) yang dirancang untuk membantu karyawan mengakses informasi dan mengelola kebutuhan administrasi kepegawaian secara lebih praktis.

Aplikasi ini dikembangkan sebagai proyek capstone dengan menggunakan HTML, CSS, dan JavaScript.

## ✨ Fitur Utama

### 👨‍💼 Employee
- Login sebagai karyawan.
- Melihat informasi dan dashboard karyawan.
- Melakukan pencatatan jam masuk dan jam pulang.
- Melihat riwayat kehadiran.
- Mengajukan cuti, izin, dan lembur.
- Melihat status pengajuan: menunggu, disetujui, atau ditolak.

### 🛡️ HR / Admin
- Login sebagai HR/Admin.
- Melihat daftar pengajuan karyawan.
- Menyetujui atau menolak pengajuan.
- Melihat ringkasan jumlah pengajuan berdasarkan status.

## 🧰 Teknologi

- **HTML5** — struktur halaman.
- **CSS3** — desain dan tampilan responsif.
- **JavaScript** — interaksi dan logika aplikasi.
- **Local Storage** — penyimpanan data demo di browser.

## 📁 Struktur Folder

```text
EmployeeHub-Trial/
├── index.html
├── dashboard.html
├── approval.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── attendance.js
│   ├── requests.js
│   └── script.js
├── README.md
└── .gitignore
```

## 🔑 Akun Demo

Gunakan akun berikut untuk mencoba aplikasi.

| Role | Employee ID | Password |
|---|---|---|
| Employee | `EMP001` | `Employee123` |
| HR / Admin | `HR001` | `Admin123` |

**Catatan:** Akun tersebut hanya untuk pengujian aplikasi demo.

## ▶️ Cara Menjalankan

1. Buka repository EmployeeHub di GitHub.
2. Unduh atau kloning repository ke komputer.
3. Buka folder proyek.
4. Jalankan `index.html` melalui browser atau gunakan ekstensi Live Server di Visual Studio Code.
5. Masuk menggunakan salah satu akun demo di atas.
6. Uji fitur kehadiran, pengajuan, dan persetujuan HR/Admin.

## 🔄 Alur Penggunaan

1. Karyawan masuk ke aplikasi.
2. Karyawan mencatat kehadiran atau mengirim pengajuan.
3. Pengajuan tersimpan dengan status **Menunggu**.
4. HR/Admin memeriksa pengajuan.
5. HR/Admin menyetujui atau menolak pengajuan.
6. Karyawan dapat melihat status pengajuannya.

## ⚠️ Batasan Versi Demo

Versi ini menggunakan penyimpanan lokal browser (`localStorage` dan `sessionStorage`). Data belum tersimpan di server atau database bersama, sehingga data antarbrowser atau antarkomputer tidak otomatis tersinkronisasi.

Autentikasi dan pembatasan akses masih berbasis JavaScript di sisi klien. Untuk penggunaan nyata di perusahaan, aplikasi perlu dikembangkan dengan backend, database, autentikasi server, dan kontrol akses yang aman.

## 🎯 Tujuan Proyek

Membuat prototipe portal layanan mandiri karyawan yang membantu menyederhanakan proses administrasi kepegawaian serta memberikan pengalaman penggunaan yang praktis dan responsif.

---

**EmployeeHub — Simplifying Employee Services.**
