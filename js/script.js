const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const employeeId =
        document.getElementById("employeeId").value;

    const password =
        document.getElementById("password").value;


    if (employeeId === "EMP001" && password === "123456") {

        window.location.href = "dashboard.html";

    } else {

        alert("Employee ID atau password salah.");

    }

});
