
/* =========================================
   EMPLOYEEHUB
   Application Core
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    initApp();
});


/* =========================================
   1. INITIALIZE APPLICATION
   ========================================= */

function initApp() {
    const body = document.body;

    // Periksa sesi hanya pada halaman yang dilindungi.
    if (body.dataset.protected === "true") {
        const allowedRoles = body.dataset.allowedRoles
            ? body.dataset.allowedRoles.split(",").map(function (role) {
                return role.trim();
            })
            : ["employee", "admin"];

        const user = requireRole(allowedRoles);

        // Hentikan inisialisasi jika sesi atau role tidak valid.
        if (!user) {
            return;
        }

        renderUserInfo(user);
    }

    initLogoutButtons();
    initActiveNavigation();
    initCurrentDate();
    initSidebarToggle();
}


/* =========================================
   2. DISPLAY USER INFORMATION
   ========================================= */

function renderUserInfo(user) {
    const nameElements = document.querySelectorAll("[data-user-name]");
    const idElements = document.querySelectorAll("[data-user-id]");
    const roleElements = document.querySelectorAll("[data-user-role]");
    const initialElements = document.querySelectorAll("[data-user-initial]");

    nameElements.forEach(function (element) {
        element.textContent = user.name;
    });

    idElements.forEach(function (element) {
        element.textContent = user.employeeId;
    });

    roleElements.forEach(function (element) {
        element.textContent = formatRole(user.role);
    });

    const initials = getInitials(user.name);

    initialElements.forEach(function (element) {
        element.textContent = initials;
    });
}


function formatRole(role) {
    const roleNames = {
        employee: "Karyawan",
        admin: "HR / Administrator"
    };

    return roleNames[role] || "Pengguna";
}


function getInitials(name) {
    if (!name) {
        return "EH";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (word) {
            return word.charAt(0).toUpperCase();
        })
        .join("");
}


/* =========================================
   3. LOGOUT
   ========================================= */

function initLogoutButtons() {
    const logoutButtons = document.querySelectorAll("[data-logout]");

    logoutButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const confirmed = window.confirm(
                "Apakah kamu yakin ingin keluar dari EmployeeHub?"
            );

            if (confirmed) {
                logout();
            }
        });
    });
}


/* =========================================
   4. ACTIVE NAVIGATION
   ========================================= */

function initActiveNavigation() {
    const currentPage = window.location.pathname
        .split("/")
        .pop() || "index.html";

    const navLinks = document.querySelectorAll("[data-nav-link]");

    navLinks.forEach(function (link) {
        const linkPage = link.getAttribute("href");

        if (!linkPage) {
            return;
        }

        const normalizedLink = linkPage.split("/").pop();

        if (normalizedLink === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }
    });
}


/* =========================================
   5. CURRENT DATE
   ========================================= */

function initCurrentDate() {
    const dateElements = document.querySelectorAll("[data-current-date]");

    const today = new Date();

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(today);

    dateElements.forEach(function (element) {
        element.textContent = formattedDate;
    });
}


/* =========================================
   6. SIDEBAR TOGGLE
   ========================================= */

function initSidebarToggle() {
    const toggleButton = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!toggleButton || !sidebar) {
        return;
    }

    function closeSidebar() {
        sidebar.classList.remove("sidebar-open");

        if (overlay) {
            overlay.classList.remove("overlay-visible");
        }

        toggleButton.setAttribute("aria-expanded", "false");
    }

    function toggleSidebar() {
        const isOpen = sidebar.classList.toggle("sidebar-open");

        if (overlay) {
            overlay.classList.toggle("overlay-visible", isOpen);
        }

        toggleButton.setAttribute("aria-expanded", String(isOpen));
    }

    toggleButton.addEventListener("click", toggleSidebar);

    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    // Tutup sidebar setelah menu dipilih di layar kecil.
    sidebar.querySelectorAll("[data-nav-link]").forEach(function (link) {
        link.addEventListener("click", closeSidebar);
    });

    // Tutup sidebar dengan tombol Escape.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}
