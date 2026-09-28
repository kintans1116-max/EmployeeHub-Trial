
/* ========================================
   EMPLOYEEHUB - REQUEST MANAGEMENT
   Pengajuan karyawan dan persetujuan HR
======================================== */

const REQUEST_STORAGE_KEY = "employeeHubRequests";

document.addEventListener("DOMContentLoaded", function () {
    initRequests();
});

function initRequests() {
    const user = typeof getCurrentUser === "function"
        ? getCurrentUser()
        : null;

    if (!user) return;

    const requestForm = document.getElementById("requestForm");
    const employeeRequests = document.getElementById("employeeRequests");
    const approvalRequests = document.getElementById("approvalRequests");

    if (requestForm) {
        requestForm.addEventListener("submit", handleRequestSubmit);
    }

    if (employeeRequests) {
        renderEmployeeRequests(user.employeeId);
    }

    if (approvalRequests && user.role === "admin") {
        renderApprovalRequests();
        approvalRequests.addEventListener(
            "click",
            handleApprovalAction
        );
    }
}

// Membaca data pengajuan dari browser.
function getRequestRecords() {
    try {
        const data = localStorage.getItem(REQUEST_STORAGE_KEY);
        const records = data ? JSON.parse(data) : [];

        return Array.isArray(records) ? records : [];
    } catch (error) {
        console.error("Gagal membaca data pengajuan:", error);
        return [];
    }
}

// Menyimpan data pengajuan.
function saveRequestRecords(records) {
    try {
        localStorage.setItem(
            REQUEST_STORAGE_KEY,
            JSON.stringify(records)
        );

        return true;
    } catch (error) {
        console.error("Gagal menyimpan data pengajuan:", error);
        showRequestMessage(
            "Data gagal disimpan. Silakan coba lagi.",
            "error"
        );

        return false;
    }
}

// Membuat ID unik untuk setiap pengajuan.
function createRequestId() {
    return "REQ-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 7);
}

// Memproses formulir pengajuan karyawan.
function handleRequestSubmit(event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user || user.role !== "employee") {
        showRequestMessage(
            "Hanya karyawan yang dapat mengajukan permintaan.",
            "error"
        );
        return;
    }

    const type = document.getElementById("requestType")?.value;
    const startDate = document.getElementById("requestDate")?.value;
    const endDate = document.getElementById("requestEndDate")?.value;
    const reason = document.getElementById("requestReason")?.value.trim();

    if (!type || !startDate || !endDate || !reason) {
        showRequestMessage(
            "Mohon lengkapi semua kolom pengajuan.",
            "error"
        );
        return;
    }

    if (endDate < startDate) {
        showRequestMessage(
            "Tanggal selesai tidak boleh sebelum tanggal mulai.",
            "error"
        );
        return;
    }

    const validTypes = ["Cuti", "Izin", "Lembur"];

    if (!validTypes.includes(type)) {
        showRequestMessage(
            "Jenis pengajuan tidak valid.",
            "error"
        );
        return;
    }

    const records = getRequestRecords();

    const newRequest = {
        id: createRequestId(),
        employeeId: user.employeeId,
        employeeName: user.name,
        type: type,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        status: "pending",
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null
    };

    records.push(newRequest);

    if (!saveRequestRecords(records)) return;

    document.getElementById("requestForm").reset();

    showRequestMessage(
        "Pengajuan berhasil dikirim dan menunggu persetujuan HR.",
        "success"
    );

    renderEmployeeRequests(user.employeeId);
}

// Menampilkan pengajuan milik karyawan yang sedang login.
function renderEmployeeRequests(employeeId) {
    const tableBody = document.getElementById("employeeRequests");

    if (!tableBody) return;

    tableBody.replaceChildren();

    const records = getRequestRecords()
        .filter(function (record) {
            return record.employeeId === employeeId;
        })
        .sort(function (a, b) {
            return new Date(b.submittedAt) -
                new Date(a.submittedAt);
        });

    if (records.length === 0) {
        showEmptyRequestRow(
            tableBody,
            5,
            "Belum ada pengajuan."
        );
        return;
    }

    records.forEach(function (record) {
        const row = document.createElement("tr");

        appendCell(row, record.type);
        appendCell(row, formatRequestDate(record.startDate));
        appendCell(row, formatRequestDate(record.endDate));
        appendCell(row, record.reason);

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "status-badge " +
            getRequestStatusClass(record.status);
        badge.textContent = getRequestStatusLabel(record.status);

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });
}

// Menampilkan seluruh pengajuan untuk HR/Admin.
function renderApprovalRequests() {
    const tableBody = document.getElementById("approvalRequests");

    if (!tableBody) return;

    tableBody.replaceChildren();

    const records = getRequestRecords()
        .sort(function (a, b) {
            // Pengajuan menunggu ditampilkan terlebih dahulu.
            if (a.status === "pending" && b.status !== "pending") {
                return -1;
            }

            if (a.status !== "pending" && b.status === "pending") {
                return 1;
            }

            return new Date(b.submittedAt) -
                new Date(a.submittedAt);
        });

    if (records.length === 0) {
        showEmptyRequestRow(
            tableBody,
            7,
            "Belum ada pengajuan dari karyawan."
        );
        return;
    }

    records.forEach(function (record) {
        const row = document.createElement("tr");

        appendCell(row, record.employeeName);
        appendCell(row, record.employeeId);
        appendCell(row, record.type);
        appendCell(row, formatRequestDate(record.startDate));
        appendCell(row, formatRequestDate(record.endDate));
        appendCell(row, record.reason);

        const actionCell = document.createElement("td");

        if (record.status === "pending") {
            const approveButton = createActionButton(
                "Setujui",
                "approve",
                record.id
            );

            const rejectButton = createActionButton(
                "Tolak",
                "reject",
                record.id
            );

            actionCell.append(approveButton, rejectButton);
        } else {
            const badge = document.createElement("span");

            badge.className = "status-badge " +
                getRequestStatusClass(record.status);
            badge.textContent = getRequestStatusLabel(record.status);

            actionCell.appendChild(badge);
        }

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Membuat tombol tindakan tanpa menyisipkan HTML mentah.
function createActionButton(label, action, requestId) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.dataset.requestAction = action;
    button.dataset.requestId = requestId;
    button.className = action === "approve"
        ? "btn btn-primary"
        : "btn btn-danger";

    return button;
}

// Memproses tindakan persetujuan HR/Admin.
function handleApprovalAction(event) {
    const button = event.target.closest("[data-request-action]");

    if (!button) return;

    const user = getCurrentUser();

    if (!user || user.role !== "admin") {
        showRequestMessage(
            "Kamu tidak memiliki akses untuk menyetujui pengajuan.",
            "error"
        );
        return;
    }

    const action = button.dataset.requestAction;
    const requestId = button.dataset.requestId;

    if (!["approve", "reject"].includes(action)) return;

    const records = getRequestRecords();

    const request = records.find(function (record) {
        return record.id === requestId;
    });

    if (!request || request.status !== "pending") {
        renderApprovalRequests();
        return;
    }

    const decision = action === "approve"
        ? "menyetujui"
        : "menolak";

    if (!confirm(
        `Apakah kamu yakin ingin ${decision} pengajuan ini?`
    )) {
        return;
    }

    request.status = action === "approve"
        ? "approved"
        : "rejected";

    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = user.name;

    if (!saveRequestRecords(records)) return;

    renderApprovalRequests();

    showRequestMessage(
        action === "approve"
            ? "Pengajuan berhasil disetujui."
            : "Pengajuan berhasil ditolak.",
        "success"
    );
}

// Membuat sel tabel dengan teks yang aman.
function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value || "-";
    row.appendChild(cell);
}

// Menampilkan pesan jika tabel kosong.
function showEmptyRequestRow(tableBody, columnCount, message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columnCount;
    cell.textContent = message;
    cell.className = "empty-state";

    row.appendChild(cell);
    tableBody.appendChild(row);
}

// Mengubah kode status menjadi label yang mudah dipahami.
function getRequestStatusLabel(status) {
    const labels = {
        pending: "Menunggu",
        approved: "Disetujui",
        rejected: "Ditolak"
    };

    return labels[status] || "Tidak diketahui";
}

// Menentukan kelas CSS berdasarkan status.
function getRequestStatusClass(status) {
    const classes = {
        pending: "status-pending",
        approved: "status-approved",
        rejected: "status-rejected"
    };

    return classes[status] || "status-pending";
}

// Memformat tanggal pengajuan.
function formatRequestDate(dateString) {
    if (!dateString) return "-";

    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

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

// Menampilkan pesan kepada pengguna.
function showRequestMessage(message, type) {
    const messageElement = document.getElementById("requestMessage");

    if (!messageElement) {
        alert(message);
        return;
    }

    messageElement.textContent = message;
    messageElement.className = "login-message " + type;
    messageElement.hidden = false;
}
