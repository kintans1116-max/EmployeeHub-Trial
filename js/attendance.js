
/* ========================================
   EMPLOYEEHUB - ATTENDANCE SYSTEM
   Mengatur absensi masuk dan pulang
======================================== */

const ATTENDANCE_STORAGE_KEY = "employeeHubAttendance";

document.addEventListener("DOMContentLoaded", function () {
    initAttendance();
});

function initAttendance() {
    // Jalankan hanya jika halaman memiliki fitur absensi.
    const clockInButton = document.getElementById("clockInButton");
    const clockOutButton = document.getElementById("clockOutButton");

    if (!clockInButton && !clockOutButton) {
        return;
    }

    const user = typeof getCurrentUser === "function"
        ? getCurrentUser()
        : null;

    if (!user) {
        return;
    }

    clockInButton?.addEventListener("click", handleClockIn);
    clockOutButton?.addEventListener("click", handleClockOut);

    updateAttendanceUI();
}

// Mendapatkan tanggal lokal dalam format YYYY-MM-DD.
function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Mendapatkan jam lokal dalam format HH.MM.
function getLocalTimeString() {
    return new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

// Membaca data absensi dari browser.
function getAttendanceRecords() {
    try {
        const records = localStorage.getItem(
            ATTENDANCE_STORAGE_KEY
        );

        return records ? JSON.parse(records) : [];
    } catch (error) {
        console.error("Gagal membaca data absensi:", error);
        return [];
    }
}

// Menyimpan data absensi ke browser.
function saveAttendanceRecords(records) {
    try {
        localStorage.setItem(
            ATTENDANCE_STORAGE_KEY,
            JSON.stringify(records)
        );

        return true;
    } catch (error) {
        console.error("Gagal menyimpan data absensi:", error);
        showAttendanceMessage(
            "Data absensi gagal disimpan di browser.",
            "error"
        );

        return false;
    }
}

// Mendapatkan data absensi karyawan hari ini.
function getTodayAttendance(employeeId) {
    const today = getLocalDateString();

    return getAttendanceRecords().find(function (record) {
        return record.employeeId === employeeId
            && record.date === today;
    });
}

// Proses absen masuk.
function handleClockIn() {
    const user = getCurrentUser();

    if (!user) {
        showAttendanceMessage(
            "Silakan login terlebih dahulu.",
            "error"
        );
        return;
    }

    const records = getAttendanceRecords();
    const today = getLocalDateString();

    const existingRecord = records.find(function (record) {
        return record.employeeId === user.employeeId
            && record.date === today;
    });

    if (existingRecord?.checkIn) {
        showAttendanceMessage(
            "Kamu sudah melakukan absen masuk hari ini.",
            "error"
        );
        return;
    }

    const newRecord = {
        employeeId: user.employeeId,
        employeeName: user.name,
        date: today,
        checkIn: getLocalTimeString(),
        checkOut: "",
        status: "Hadir"
    };

    records.push(newRecord);

    if (!saveAttendanceRecords(records)) {
        return;
    }

    showAttendanceMessage(
        "Absen masuk berhasil dicatat. Semangat bekerja!",
        "success"
    );

    updateAttendanceUI();
}

// Proses absen pulang.
function handleClockOut() {
    const user = getCurrentUser();

    if (!user) {
        showAttendanceMessage(
            "Silakan login terlebih dahulu.",
            "error"
        );
        return;
    }

    const records = getAttendanceRecords();
    const today = getLocalDateString();

    const todayRecord = records.find(function (record) {
        return record.employeeId === user.employeeId
            && record.date === today;
    });

    if (!todayRecord?.checkIn) {
        showAttendanceMessage(
            "Kamu harus absen masuk terlebih dahulu.",
            "error"
        );
        return;
    }

    if (todayRecord.checkOut) {
        showAttendanceMessage(
            "Kamu sudah melakukan absen pulang hari ini.",
            "error"
        );
        return;
    }

    todayRecord.checkOut = getLocalTimeString();

    if (!saveAttendanceRecords(records)) {
        return;
    }

    showAttendanceMessage(
        "Absen pulang berhasil dicatat. Terima kasih!",
        "success"
    );

    updateAttendanceUI();
}

// Memperbarui tampilan absensi pada halaman.
function updateAttendanceUI() {
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const todayRecord = getTodayAttendance(user.employeeId);

    const statusElement = document.getElementById(
        "attendanceStatus"
    );

    const checkInElement = document.getElementById("checkInTime");
    const checkOutElement = document.getElementById("checkOutTime");

    const clockInButton = document.getElementById("clockInButton");
    const clockOutButton = document.getElementById("clockOutButton");

    const hasCheckedIn = Boolean(todayRecord?.checkIn);
    const hasCheckedOut = Boolean(todayRecord?.checkOut);

    if (statusElement) {
        statusElement.textContent = !hasCheckedIn
            ? "Belum Absen"
            : hasCheckedOut
                ? "Absensi Selesai"
                : "Sudah Absen Masuk";

        statusElement.classList.remove(
            "status-pending",
            "status-approved",
            "status-rejected"
        );

        if (hasCheckedOut) {
            statusElement.classList.add("status-approved");
        } else if (hasCheckedIn) {
            statusElement.classList.add("status-pending");
        }
    }

    if (checkInElement) {
        checkInElement.textContent =
            todayRecord?.checkIn || "--:--";
    }

    if (checkOutElement) {
        checkOutElement.textContent =
            todayRecord?.checkOut || "--:--";
    }

    if (clockInButton) {
        clockInButton.disabled = hasCheckedIn;
        clockInButton.textContent = hasCheckedIn
            ? "Sudah Absen Masuk"
            : "Absen Masuk";
    }

    if (clockOutButton) {
        clockOutButton.disabled = !hasCheckedIn || hasCheckedOut;
        clockOutButton.textContent = hasCheckedOut
            ? "Sudah Absen Pulang"
            : "Absen Pulang";
    }

    renderAttendanceHistory(user.employeeId);
    renderAttendanceDate();
}

// Menampilkan tanggal hari ini.
function renderAttendanceDate() {
    const dateElement = document.querySelector(
        "[data-attendance-date]"
    );

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }
}

// Menampilkan riwayat absensi milik karyawan.
function renderAttendanceHistory(employeeId) {
    const tableBody = document.getElementById("attendanceHistory");

    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    const records = getAttendanceRecords()
        .filter(function (record) {
            return record.employeeId === employeeId;
        })
        .sort(function (a, b) {
            return b.date.localeCompare(a.date);
        });

    if (records.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "Belum ada riwayat absensi.";
        cell.className = "empty-state";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    records.forEach(function (record) {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        const checkInCell = document.createElement("td");
        const checkOutCell = document.createElement("td");
        const statusCell = document.createElement("td");

        dateCell.textContent = formatAttendanceDate(record.date);
        checkInCell.textContent = record.checkIn || "--:--";
        checkOutCell.textContent = record.checkOut || "--:--";
        statusCell.textContent = record.checkOut
            ? "Selesai"
            : "Hadir";

        row.append(
            dateCell,
            checkInCell,
            checkOutCell,
            statusCell
        );

        tableBody.appendChild(row);
    });
}

// Mengubah tanggal menjadi format yang mudah dibaca.
function formatAttendanceDate(dateString) {
    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Menampilkan pesan berhasil atau gagal.
function showAttendanceMessage(message, type) {
    const messageElement = document.getElementById(
        "attendanceMessage"
    );

    if (!messageElement) {
        alert(message);
        return;
    }

    messageElement.textContent = message;
    messageElement.className =
        "login-message " + type;
    messageElement.hidden = false;
}
