const BASE_URL = "http://localhost:5000/api";

function checkUserSession() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html"; 
    } else {
        const payload = JSON.parse(atob(token.split(".")[1]));
        document.getElementById("userRole").innerText = `Rol: ${payload.role}`;

        if (payload.role === "admin" || payload.role === "director" || payload.role === "gerente") {
            document.getElementById("adminLinkItem").style.display = "block";
            document.getElementById("adminPanel").style.display = "block";
        }
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function showSection(sectionId) {
    const sections = [
        "welcomeSection",
        "quickPunchSection",
        "adminPanel",
        "addUserSection",
        "employeesSection",
        "createEmployeeSection",
        "editEmployeeSection",
        "punchHistorySection",
        "reportsSection"
    ];
    
    sections.forEach(section => {
        document.getElementById(section).style.display = "none";
    });
    
    if (sectionId === "dashboard") {
        document.getElementById("welcomeSection").style.display = "block";
        document.getElementById("quickPunchSection").style.display = "block";
        if (document.getElementById("adminPanel").style.display !== "none") {
            document.getElementById("adminPanel").style.display = "block";
        }
    } else if (sectionId === "employees") {
        document.getElementById("employeesSection").style.display = "block";
        loadEmployees();
    } else if (sectionId === "punches") {
        document.getElementById("punchHistorySection").style.display = "block";
        loadPunchHistory();
    } else if (sectionId === "reports") {
        document.getElementById("reportsSection").style.display = "block";
        loadEmployeesForPayroll();
    } else if (sectionId === "admin") {
        document.getElementById("adminPanel").style.display = "block";
    }
    
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });
    
    const activeLink = document.getElementById(sectionId + "Link");
    if (activeLink) {
        activeLink.classList.add("active");
    }
}

async function loadEmployees() {
    const token = localStorage.getItem("token");
    const employeesTable = document.querySelector("#employeesTable tbody");

    try {
        const response = await fetch(`${BASE_URL}/employees`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const employees = await response.json();
        employeesTable.innerHTML = "";

        employees.forEach(employee => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.cedula}</td>
                <td>${employee.fullname}</td>
               <td>$${(parseFloat(employee.price_per_hour) || 0).toFixed(2)}</td>        
                       <td>
                    <button class="btn btn-sm btn-warning edit-employee" data-id="${employee.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger delete-employee" data-id="${employee.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            employeesTable.appendChild(row);
        });

        document.querySelectorAll(".edit-employee").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const employeeId = e.target.closest("button").getAttribute("data-id");
                editEmployee(employeeId);
            });
        });

        document.querySelectorAll(".delete-employee").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const employeeId = e.target.closest("button").getAttribute("data-id");
                deleteEmployee(employeeId);
            });
        });
    } catch (error) {
        console.error("Error al cargar empleados:", error);
        employeesTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="alert alert-danger">
                        Error al cargar empleados: ${error.message}
                    </div>
                </td>
            </tr>
        `;
    }
}

async function registerPunch() {
    const token = localStorage.getItem("token");
    const punchMessage = document.getElementById("punchMessage");
    
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userCedula = payload.cedula;
        
        const employeeResponse = await fetch(`${BASE_URL}/employees/cedula/${userCedula}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!employeeResponse.ok) {
            throw new Error("No se pudo encontrar el empleado correspondiente a su usuario");
        }
        
        const employee = await employeeResponse.json();
        const employeeId = employee.id;
        
        const punchResponse = await fetch(`${BASE_URL}/ponches/${employeeId}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            }
        });

        if (!punchResponse.ok) {
            const errorData = await punchResponse.json();
            throw new Error(errorData.error || `Error: ${punchResponse.status}`);
        }

        const result = await punchResponse.json();
        punchMessage.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Ponche registrado exitosamente
            </div>
        `;
        
        getLastPunch(employeeId);
    } catch (error) {
        console.error("Error al registrar ponche:", error);
        punchMessage.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Error: ${error.message}
            </div>
        `;
    }
}

async function getLastPunch(userId) {
    const token = localStorage.getItem("token");
    const lastPunchInfo = document.getElementById("lastPunchInfo");
    
    if (!userId) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.id;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/ponches/employee/${userId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const ponches = await response.json();
        
        if (ponches && ponches.length > 0) {
            const lastPunch = ponches[0];
            const entryDate = new Date(lastPunch.fecha_entrada);
            const exitDate = lastPunch.fecha_salida ? new Date(lastPunch.fecha_salida) : null;
            
            if (exitDate) {
                lastPunchInfo.innerHTML = `
                    <i class="fas fa-info-circle"></i> Último ponche: 
                    <strong>Salida</strong> a las 
                    <strong>${exitDate.toLocaleTimeString()}</strong> del 
                    <strong>${exitDate.toLocaleDateString()}</strong>
                `;
            } else {
                lastPunchInfo.innerHTML = `
                    <i class="fas fa-info-circle"></i> Último ponche: 
                    <strong>Entrada</strong> a las 
                    <strong>${entryDate.toLocaleTimeString()}</strong> del 
                    <strong>${entryDate.toLocaleDateString()}</strong>
                `;
            }
        } else {
            lastPunchInfo.innerHTML = `
                <i class="fas fa-info-circle"></i> No hay registros de ponches recientes.
            `;
        }
    } catch (error) {
        console.error("Error al obtener último ponche:", error);
        lastPunchInfo.innerHTML = `
            <i class="fas fa-exclamation-circle"></i> Error al obtener información de ponches: ${error.message}
        `;
    }
}

async function loadPunchHistory() {
    const token = localStorage.getItem("token");
    const punchTableBody = document.getElementById("punchTableBody");

    try {
        const response = await fetch(`${BASE_URL}/ponches`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const ponches = await response.json();
        punchTableBody.innerHTML = "";

        ponches.forEach(punch => {
            const row = document.createElement("tr");
            const entryDate = new Date(punch.fecha_entrada);
            const exitDate = punch.fecha_salida ? new Date(punch.fecha_salida) : null;
            
            row.innerHTML = `
                <td>${punch.id}</td>
                <td>${punch.fullname || 'N/A'}</td>
                <td>${punch.cedula || 'N/A'}</td>
                <td>${entryDate.toLocaleDateString()}</td>
                <td>${entryDate.toLocaleTimeString()}</td>
                <td>${exitDate ? exitDate.toLocaleTimeString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-punch" data-id="${punch.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            punchTableBody.appendChild(row);
        });
        
        document.querySelectorAll(".delete-punch").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const punchId = e.target.closest("button").getAttribute("data-id");
                deletePunch(punchId);
            });
        });
    } catch (error) {
        console.error("Error al cargar historial de ponches:", error);
        punchTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="alert alert-danger">
                        Error al cargar historial de ponches: ${error.message}
                    </div>
                </td>
            </tr>
        `;
    }
}

async function loadDashboardStats() {
    const token = localStorage.getItem("token");
    const dashboardStats = document.getElementById("dashboardStats");
    
    try {
        dashboardStats.innerHTML = `
            <div class="col-md-4 mb-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h1><i class="fas fa-users"></i> -</h1>
                        <h5>Empleados Registrados</h5>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h1><i class="fas fa-clock"></i> -</h1>
                        <h5>Ponches Registrados</h5>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <h1><i class="fas fa-calendar-alt"></i> ${new Date().toLocaleDateString()}</h1>
                        <h5>Fecha Actual</h5>
                    </div>
                </div>
            </div>
        `;
        
        try {
            const employeesResponse = await fetch(`${BASE_URL}/employees`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (employeesResponse.ok) {
                const employees = await employeesResponse.json();
                document.querySelector("#dashboardStats .bg-primary h1").innerHTML = 
                    `<i class="fas fa-users"></i> ${employees.length}`;
            }
        } catch (e) {
            console.error("Error loading employee count:", e);
        }
        
        try {
            const punchesResponse = await fetch(`${BASE_URL}/ponches`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (punchesResponse.ok) {
                const ponches = await punchesResponse.json();
                document.querySelector("#dashboardStats .bg-success h1").innerHTML = 
                    `<i class="fas fa-clock"></i> ${ponches.length}`;
            }
        } catch (e) {
            console.error("Error loading punch count:", e);
        }
    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        dashboardStats.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> Error al cargar estadísticas: ${error.message}
                </div>
            </div>
        `;
    }
}

async function loadEmployeesForPayroll() {
    const token = localStorage.getItem("token");
    const payrollTable = document.getElementById("payrollTableBody");
    const employeeSelect = document.getElementById("employeeForPayroll");

    try {
        const response = await fetch(`${BASE_URL}/employees`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const employees = await response.json();
        payrollTable.innerHTML = "";
        
        employeeSelect.innerHTML = '<option selected>Seleccione un empleado...</option>';

        for (const employee of employees) {
            const option = document.createElement("option");
            option.value = employee.id;
            option.textContent = `${employee.fullname} (${employee.cedula})`;
            employeeSelect.appendChild(option);
            
            try {
                const hoursResponse = await fetch(`${BASE_URL}/ponches/employee/${employee.id}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
    
                if (!hoursResponse.ok) throw new Error(`Error: ${hoursResponse.status}`);
    
                const ponches = await hoursResponse.json();
                let totalHours = 0;
                
                ponches.forEach(punch => {
                    if (punch.fecha_entrada && punch.fecha_salida) {
                        const entry = new Date(punch.fecha_entrada);
                        const exit = new Date(punch.fecha_salida);
                        const hours = (exit - entry) / (1000 * 60 * 60);
                        totalHours += hours;
                    }
                });
                
                const totalPay = (totalHours * (employee.price_per_hour || 0)).toFixed(2);
    
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.fullname}</td>
                    <td>${employee.cedula}</td>
                    <td>${totalHours.toFixed(2)}</td>
                    <td>$${(parseFloat(employee.price_per_hour) || 0).toFixed(2)}</td>
                    <td>$${totalPay}</td>
                `;
                payrollTable.appendChild(row);
            } catch (err) {
                console.error(`Error calculating hours for employee ${employee.id}:`, err);
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.fullname}</td>
                    <td>${employee.cedula}</td>
                    <td>-</td>
                    <td>$${(parseFloat(employee.price_per_hour) || 0).toFixed(2)}</td>
                    <td>-</td>
                `;
                payrollTable.appendChild(row);
            }
        }
    } catch (error) {
        console.error("Error al cargar empleados para nómina:", error);
        payrollTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="alert alert-danger">
                        Error al cargar datos para nómina: ${error.message}
                    </div>
                </td>
            </tr>
        `;
    }
}

async function downloadExcelReport() {
    try {
        const token = localStorage.getItem("token");
        
        const excelBtn = document.getElementById("reportExcelBtn");
        const originalText = excelBtn.innerHTML;
        excelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        excelBtn.disabled = true;
        
        const response = await fetch(`${BASE_URL}/reports/excel`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        excelBtn.innerHTML = originalText;
        excelBtn.disabled = false;
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nomina.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert("Reporte Excel generado exitosamente!");
    } catch (error) {
        console.error("Error al generar reporte Excel:", error);
        alert(`Error al generar reporte: ${error.message}`);
    }
}

async function downloadPdfReport() {
    try {
        const token = localStorage.getItem("token");
        
        const pdfBtn = document.getElementById("reportPdfBtn");
        const originalText = pdfBtn.innerHTML;
        pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        pdfBtn.disabled = true;
        
        const response = await fetch(`${BASE_URL}/reports/pdf`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        pdfBtn.innerHTML = originalText;
        pdfBtn.disabled = false;
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nomina.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert("Reporte PDF generado exitosamente!");
    } catch (error) {
        console.error("Error al generar reporte PDF:", error);
        alert(`Error al generar reporte: ${error.message}`);
    }
}

// Function to create a new employee
async function createEmployee(event) {
    event.preventDefault();
    
    const token = localStorage.getItem("token");
    const createMessage = document.getElementById("createEmployeeMessage");
    
    // Get form values
    const fullname = document.getElementById("createEmployeeName").value;
    const cedula = document.getElementById("createEmployeeCedula").value;
    const price_per_hour = document.getElementById("createEmployeeSalary").value;
    
    // Validate inputs
    if (!fullname || !cedula || !price_per_hour) {
        createMessage.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Todos los campos son obligatorios
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/employees`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ fullname, cedula, price_per_hour: parseFloat(price_per_hour) })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        createMessage.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Empleado creado exitosamente
            </div>
        `;
        
        // Clear the form
        document.getElementById("createEmployeeName").value = "";
        document.getElementById("createEmployeeCedula").value = "";
        document.getElementById("createEmployeeSalary").value = "";
        
        // Return to employee list after a short delay
        setTimeout(() => {
            document.getElementById("createEmployeeSection").style.display = "none";
            document.getElementById("employeesSection").style.display = "block";
            loadEmployees(); // Reload the employee list
        }, 1500);
        
    } catch (error) {
        console.error("Error al crear empleado:", error);
        createMessage.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Error: ${error.message}
            </div>
        `;
    }
}

// Function to edit an employee
async function editEmployee(employeeId) {
    const token = localStorage.getItem("token");
    const editForm = document.getElementById("editEmployeeForm");
    const editMessage = document.getElementById("editEmployeeMessage");
    
    try {
        // Fetch the employee data
        const response = await fetch(`${BASE_URL}/employees/${employeeId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const employee = await response.json();
        
        // Populate the form
        document.getElementById("editEmployeeId").value = employee.id;
        document.getElementById("editEmployeeName").value = employee.fullname;
        document.getElementById("editEmployeeCedulaEdit").value = employee.cedula;
        document.getElementById("editEmployeeSalary").value = employee.price_per_hour;
        
        // Show the edit form
        document.getElementById("employeesSection").style.display = "none";
        document.getElementById("editEmployeeSection").style.display = "block";
    } catch (error) {
        console.error("Error al cargar datos del empleado:", error);
        alert(`Error al cargar datos del empleado: ${error.message}`);
    }
}

// Function to update an employee
async function updateEmployee(event) {
    event.preventDefault();
    
    const token = localStorage.getItem("token");
    const editMessage = document.getElementById("editEmployeeMessage");
    
    // Get form values
    const id = document.getElementById("editEmployeeId").value;
    const fullname = document.getElementById("editEmployeeName").value;
    const price_per_hour = document.getElementById("editEmployeeSalary").value;
    
    // Validate inputs
    if (!fullname || !price_per_hour) {
        editMessage.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> El nombre y salario son obligatorios
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/employees/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ fullname, price_per_hour: parseFloat(price_per_hour) })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        editMessage.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Empleado actualizado exitosamente
            </div>
        `;
        
        // Return to employee list after a short delay
        setTimeout(() => {
            document.getElementById("editEmployeeSection").style.display = "none";
            document.getElementById("employeesSection").style.display = "block";
            loadEmployees(); // Reload the employee list
        }, 1500);
        
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        editMessage.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Error: ${error.message}
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
    loadDashboardStats();
    getLastPunch();
    
    document.getElementById("dashboardLink").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("dashboard");
    });
    
    document.getElementById("employeesLink").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("employees");
    });
    
    document.getElementById("punchesLink").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("punches");
    });
    
    document.getElementById("reportsLink").addEventListener("click", (e) => {
        e.preventDefault();
        showSection("reports");
    });
    
    document.getElementById("adminLink")?.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("admin");
    });
    
    document.getElementById("punchForm").addEventListener("submit", (e) => {
        e.preventDefault();
        registerPunch();
    });
    
    document.getElementById("showAddUserBtn")?.addEventListener("click", () => {
        document.getElementById("adminPanel").style.display = "none";
        document.getElementById("addUserSection").style.display = "block";
    });
    
    document.getElementById("cancelAddUserBtn")?.addEventListener("click", () => {
        document.getElementById("addUserSection").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
    });
    
    document.getElementById("showCreateEmployeeBtn")?.addEventListener("click", () => {
        document.getElementById("employeesSection").style.display = "none";
        document.getElementById("createEmployeeSection").style.display = "block";
    });
    
    document.getElementById("cancelCreateEmployeeBtn")?.addEventListener("click", () => {
        document.getElementById("createEmployeeSection").style.display = "none";
        document.getElementById("employeesSection").style.display = "block";
    });
    
    document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
        document.getElementById("editEmployeeSection").style.display = "none";
        document.getElementById("employeesSection").style.display = "block";
    });
    
    document.getElementById("filterPunchesBtn")?.addEventListener("click", () => {
        loadPunchHistory();
    });
    
    document.getElementById("generatePayrollBtn")?.addEventListener("click", () => {
        const employeeId = document.getElementById("employeeForPayroll").value;
        if (employeeId && employeeId !== "Seleccione un empleado...") {
            generatePayrollReport(employeeId);
        } else {
            alert("Por favor seleccione un empleado");
        }
    });
    
    // Add these new event listeners for the create and edit forms
    document.getElementById("createEmployeeForm").addEventListener("submit", createEmployee);
    document.getElementById("editEmployeeForm").addEventListener("submit", updateEmployee);
    
    document.getElementById("reportExcelBtn")?.addEventListener("click", downloadExcelReport);
    document.getElementById("reportPdfBtn")?.addEventListener("click", downloadPdfReport);
    document.getElementById("exportExcelBtn")?.addEventListener("click", downloadExcelReport);
    document.getElementById("exportPdfBtn")?.addEventListener("click", downloadPdfReport);
    document.getElementById("logoutBtn").addEventListener("click", logout);
    
    showSection("dashboard");
});

// Update the deleteEmployee function
async function deleteEmployee(employeeId) {
    if (confirm("¿Está seguro que desea eliminar este empleado?")) {
        const token = localStorage.getItem("token");
        
        try {
            const response = await fetch(`${BASE_URL}/employees/${employeeId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status}`);
            }
            
            // Show success notification
            alert("Empleado eliminado exitosamente");
            
            // Reload the employee list to reflect the changes
            loadEmployees();
            
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
            alert(`Error al eliminar empleado: ${error.message}`);
        }
    }
}

function deletePunch(punchId) {
    if (confirm("¿Está seguro que desea eliminar este registro de ponche?")) {
        console.log("Deleting punch:", punchId);
    }
}

function generatePayrollReport(employeeId) {
    console.log("Generating payroll for employee:", employeeId);
    document.getElementById("payrollResult").style.display = "block";
}