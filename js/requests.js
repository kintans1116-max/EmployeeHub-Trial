

/* ========================================
   EMPLOYEEHUB - REQUEST MANAGEMENT
======================================== */

const REQUEST_STORAGE_KEY = "employeeHubRequests";

document.addEventListener("DOMContentLoaded", initRequests);

function initRequests() {
    const user = getCurrentUser();

    if (!user) return;

    const form = document.getElementById("requestForm");
    const employeeTable = document.getElementById("employeeRequests");
    const approvalTable = document.getElementById("approvalRequests");

    if (form && user.role === "employee") {
        form.addEventListener("submit", handleRequestSubmit);
    }

    if (employeeTable && user.role === "employee") {
        renderEmployeeRequests(user.employeeId);
    }

    if (approvalTable && user.role === "admin") {
        approvalTable.addEventListener("click", handleApprovalAction);
        renderApprovalRequests();
    }
}

function getRequestRecords() {
    try {
        const data = JSON.parse(
            localStorage.getItem(REQUEST_STORAGE_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Gagal membaca pengajuan:", error);
        return [];
    }
}

function saveRequestRecords(records) {
    try {
        localStorage.setItem(
            REQUEST_STORAGE_KEY,
            JSON.stringify(records)
        );
        return true;
    } catch (error) {
        console.error("Gagal menyimpan pengajuan:", error);
        showRequestMessage("Data gagal disimpan.", "error");
        return false;
    }
}

function createRequestId() {
    return "REQ-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 7);
}

// Membuat pengajuan baru.
function handleRequestSubmit(event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user || user.role !== "employee") return;

    const type = document.getElementById("requestType").value;
    const startDate = document.getElementById("requestDate").value;
    const endDate = document.getElementById("requestEndDate").value;
    const reason = document.getElementById("requestReason").value.trim();

    if (!type || !startDate || !endDate || !reason) {
        showRequestMessage("Lengkapi semua kolom pengajuan.", "error");
        return;
    }

    if (endDate < startDate) {
        showRequestMessage(
            "Tanggal selesai tidak boleh sebelum tanggal mulai.",
            "error"
        );
        return;
    }

    if (!["Cuti", "Izin", "Lembur"].includes(type)) {
        showRequestMessage("Jenis pengajuan tidak valid.", "error");
        return;
    }

    const records = getRequestRecords();

    records.push({
        id: createRequestId(),
        employeeId: user.employeeId,
        employeeName: user.name,
        type,
        startDate,
        endDate,
        reason,
        status: "pending",
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null
    });

    if (!saveRequestRecords(records)) return;

    document.getElementById("requestForm").reset();

    showRequestMessage(
        "Pengajuan berhasil dikirim dan menunggu persetujuan HR.",
        "success"
    );

    renderEmployeeRequests(user.employeeId);
}

// Menampilkan pengajuan milik karyawan.
function renderEmployeeRequests(employeeId) {
    const tbody = document.getElementById("employeeRequests");

    if (!tbody) return;

    tbody.replaceChildren();

    const records = getRequestRecords()
        .filter(item => item.employeeId === employeeId)
        .sort((a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );

    if (!records.length) {
        showEmptyRow(tbody, 5, "Belum ada pengajuan.");
        return;
    }

    records.forEach(item => {
        const row = document.createElement("tr");

        appendCell(row, item.type);
        appendCell(row, formatRequestDate(item.startDate));
        appendCell(row, formatRequestDate(item.endDate));
        appendCell(row, item.reason);

        const cell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className =
            "status-badge " + getStatusClass(item.status);
        badge.textContent = getStatusLabel(item.status);

        cell.appendChild(badge);
        row.appendChild(cell);
        tbody.appendChild(row);
    });
}

// Menampilkan seluruh pengajuan untuk HR/Admin.
function renderApprovalRequests() {
    const tbody = document.getElementById("approvalRequests");

    if (!tbody) return;

    tbody.replaceChildren();

    const records = getRequestRecords().sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;

        return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    if (!records.length) {
        showEmptyRow(
            tbody,
            7,
            "Belum ada pengajuan dari karyawan."
        );
        renderRequestStats(records);
        return;
    }

    records.forEach(item => {
        const row = document.createElement("tr");

        appendCell(row, item.employeeName);
        appendCell(row, item.employeeId);
        appendCell(row, item.type);
        appendCell(row, formatRequestDate(item.startDate));
        appendCell(row, formatRequestDate(item.endDate));
        appendCell(row, item.reason);

        const actionCell = document.createElement("td");

        if (item.status === "pending") {
            actionCell.appendChild(
                createActionButton("Setujui", "approve", item.id)
            );

            actionCell.appendChild(
                createActionButton("Tolak", "reject", item.id)
            );
        } else {
            const badge = document.createElement("span");

            badge.className =
                "status-badge " + getStatusClass(item.status);
            badge.textContent = getStatusLabel(item.status);

            actionCell.appendChild(badge);
        }

        row.appendChild(actionCell);
        tbody.appendChild(row);
    });

    renderRequestStats(records);
}

// Memperbarui angka ringkasan di halaman HR/Admin.
function renderRequestStats(records = getRequestRecords()) {
    const total = records.length;
    const pending = records.filter(
        item => item.status === "pending"
    ).length;
    const approved = records.filter(
        item => item.status === "approved"
    ).length;
    const rejected = records.filter(
        item => item.status === "rejected"
    ).length;

    setText("totalRequests", total);
    setText("pendingRequests", pending);
    setText("approvedRequests", approved);
    setText("rejectedRequests", rejected);
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function createActionButton(label, action, id) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.dataset.requestAction = action;
    button.dataset.requestId = id;
    button.className = action === "approve"
        ? "btn btn-primary"
        : "btn btn-danger";

    return button;
}

// Memproses keputusan HR/Admin.
function handleApprovalAction(event) {
    const button = event.target.closest("[data-request-action]");

    if (!button) return;

    const user = getCurrentUser();

    if (!user || user.role !== "admin") {
        showRequestMessage("Akses hanya untuk HR/Admin.", "error");
        return;
    }

    const action = button.dataset.requestAction;
    const id = button.dataset.requestId;

    if (!["approve", "reject"].includes(action)) return;

    const records = getRequestRecords();
    const request = records.find(item => item.id === id);

    if (!request || request.status !== "pending") {
        renderApprovalRequests();
        return;
    }

    const decision = action === "approve" ? "menyetujui" : "menolak";

    if (!confirm(`Yakin ingin ${decision} pengajuan ini?`)) return;

    request.status = action === "approve" ? "approved" : "rejected";
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

function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value || "-";
    row.appendChild(cell);
}

function showEmptyRow(tbody, columns, message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columns;
    cell.className = "empty-state";
    cell.textContent = message;

    row.appendChild(cell);
    tbody.appendChild(row);
}

function getStatusLabel(status) {
    const labels = {
        pending: "Menunggu",
        approved: "Disetujui",
        rejected: "Ditolak"
    };

    return labels[status] || "Tidak diketahui";
}

function getStatusClass(status) {
    const classes = {
        pending: "status-pending",
        approved: "status-approved",
        rejected: "status-rejected"
    };

    return classes[status] || "status-pending";
}

function formatRequestDate(value) {
    if (!value) return "-";

    const parts = value.split("-");

    if (parts.length !== 3) return value;

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

function showRequestMessage(message, type) {
    const element = document.getElementById("requestMessage");

    if (!element) {
        alert(message);
        return;
    }

    element.textContent = message;
    element.className = "login-message " + type;
    element.hidden = false;
}
