document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

   

    // 🟢 Función para iniciar sesión
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const cedula = document.getElementById("loginCedula").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cedula, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);

                // 🔹 Decodificar el token para verificar el rol del usuario
                const payload = JSON.parse(atob(data.token.split(".")[1]));
                console.log("Usuario logueado con rol:", payload.role);

                // 🔹 Redirigir al Dashboard después del login
                window.location.href = "dashboard.html";
            } else {
                document.getElementById("loginMessage").innerText = "Credenciales inválidas.";
            }
        } catch (error) {
            console.error("Error en la solicitud de login:", error);
        }
    });
});

