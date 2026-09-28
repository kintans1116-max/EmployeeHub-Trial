
/* =========================================
   EMPLOYEEHUB
   Authentication - Demo Version
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    initPasswordToggle();
});


/* =========================================
   1. DEMO ACCOUNTS
   ========================================= */

// Akun berikut hanya untuk demonstrasi frontend.
// Jangan gunakan kredensial ini untuk sistem produksi.

const demoAccounts = [
    {
        employeeId: "EMP001",
        password: "Employee123",
        name: "Demo Employee",
        role: "employee"
    },
    {
        employeeId: "HR001",
        password: "Admin123",
        name: "Demo HR Admin",
        role: "admin"
    }
];


/* =========================================
   2. LOGIN FORM
   ========================================= */

function initLogin() {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        handleLogin();
    });
}


function handleLogin() {
    const employeeIdInput = document.getElementById("employeeId");
    const passwordInput = document.getElementById("password");
    const rememberMeInput = document.getElementById("rememberMe");
    const loginButton = document.getElementById("loginButton");

    const employeeId = employeeIdInput.value.trim();
    const password = passwordInput.value;

    if (!employeeId || !password) {
        showLoginMessage(
            "Employee ID dan password wajib diisi.",
            "error"
        );

        return;
    }

    const account = demoAccounts.find(function (user) {
        return (
            user.employeeId.toLowerCase() === employeeId.toLowerCase() &&
            user.password === password
        );
    });

    if (!account) {
        showLoginMessage(
            "Employee ID atau password tidak sesuai.",
            "error"
        );

        passwordInput.value = "";
        passwordInput.focus();

        return;
    }

    saveLoginSession(account, rememberMeInput.checked);

    showLoginMessage(
        "Login berhasil. Mengalihkan ke halaman utama...",
        "success"
    );

    loginButton.disabled = true;

    const buttonText = loginButton.querySelector(".button-text");

    if (buttonText) {
        buttonText.textContent = "Signing in...";
    }

    window.setTimeout(function () {
        if (account.role === "admin") {
            window.location.href = "approval.html";
        } else {
            window.location.href = "dashboard.html";
        }
    }, 500);
}


/* =========================================
   3. SAVE LOGIN SESSION
   ========================================= */

function saveLoginSession(account, rememberMe) {
    const userSession = {
        employeeId: account.employeeId,
        name: account.name,
        role: account.role,
        loginTime: new Date().toISOString()
    };

    // Hapus sesi lama agar tidak ada dua sesi aktif
    // di dua jenis penyimpanan sekaligus.

    localStorage.removeItem("employeeHubUser");
    sessionStorage.removeItem("employeeHubUser");

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(
        "employeeHubUser",
        JSON.stringify(userSession)
    );
}


/* =========================================
   4. PASSWORD VISIBILITY
   ========================================= */

function initPasswordToggle() {
    const passwordInput = document.getElementById("password");
    const toggleButton = document.getElementById("togglePassword");

    if (!passwordInput || !toggleButton) {
        return;
    }

    toggleButton.addEventListener("click", function () {
        const isPasswordHidden = passwordInput.type === "password";

        passwordInput.type = isPasswordHidden ? "text" : "password";

        toggleButton.textContent = isPasswordHidden ? "Hide" : "Show";

        toggleButton.setAttribute(
            "aria-label",
            isPasswordHidden ? "Sembunyikan password" : "Tampilkan password"
        );

        toggleButton.setAttribute(
            "aria-pressed",
            String(isPasswordHidden)
        );
    });
}


/* =========================================
   5. LOGIN FEEDBACK
   ========================================= */

function showLoginMessage(message, type) {
    const messageElement = document.getElementById("loginMessage");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className = "login-message " + type;
    messageElement.hidden = false;
}


/* =========================================
   6. SESSION HELPERS
   ========================================= */

// Mengambil informasi pengguna yang sedang login.
// Fungsi ini akan digunakan oleh dashboard dan
// halaman HR/Admin.

function getCurrentUser() {
    const savedSession =
        sessionStorage.getItem("employeeHubUser") ||
        localStorage.getItem("employeeHubUser");

    if (!savedSession) {
        return null;
    }

    try {
        return JSON.parse(savedSession);
    } catch (error) {
        console.error("Gagal membaca sesi pengguna:", error);

        sessionStorage.removeItem("employeeHubUser");
        localStorage.removeItem("employeeHubUser");

        return null;
    }
}


// Memastikan pengguna sudah login sebelum
// mengakses halaman internal.

function requireLogin() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.replace("index.html");
        return null;
    }

    return currentUser;
}


// Memastikan halaman hanya diakses oleh role tertentu.

function requireRole(allowedRoles) {
    const currentUser = requireLogin();

    if (!currentUser) {
        return null;
    }

    if (!allowedRoles.includes(currentUser.role)) {
        if (currentUser.role === "admin") {
            window.location.replace("approval.html");
        } else {
            window.location.replace("dashboard.html");
        }

        return null;
    }

    return currentUser;
}


// Menghapus sesi pengguna ketika logout.

function logout() {
    localStorage.removeItem("employeeHubUser");
    sessionStorage.removeItem("employeeHubUser");

    window.location.replace("index.html");
}
