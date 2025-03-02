import express,{Request,Response} from "express";
import employeeService from "../services/employeeService";
import { authenticate } from "../middleware/authMiddleware";
import { verifyRole } from "../middleware/authMiddleware";


const router = express.Router();




// Get all employees
router.get("/", authenticate, verifyRole(["director", "manager","supervisor"]), async (req, res) => {
    try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
    } catch (error) {
        res.status(500).json({error: "Error getting employees"});
    }
});

router.get("/cedula/:cedula", authenticate, async (req, res) => {
    try {
        const { cedula } = req.params;
        const employee = await employeeService.getEmployeeByCedula(cedula);
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ error: "Employee not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error getting employee" });
    }
});

 // Get employee by id
 router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const employee = await employeeService.getEmployeeById(id);
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ error: "Employee not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error getting employee" });
    }
});
  // Add a new employee
  router.post("/", authenticate, async (req, res) => {
    try {
      const { cedula, fullname, price_per_hour } = req.body;
      if (!cedula || !fullname || !price_per_hour) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }
      console.log("Attempting to add employee:", { cedula, fullname, price_per_hour });


      const newEmployee = await employeeService.addEmployee({ cedula, fullname, price_per_hour });
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(500).json({ error: "Error al crear empleado" });
    }
  });
    // Update an employee
    router.put("/:id", authenticate, async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { fullname, price_per_hour } = req.body;
            const updatedEmployee = await employeeService.updateEmployee(id, { fullname, price_per_hour });
            if (updatedEmployee) res.json(updatedEmployee);
            else res.status(404).json({ error: "Employee not found" });
        } catch (error) {
            res.status(500).json({ error: "Error updating employee" });
        }
    });
       // Delete an employee
       router.delete("/:id", authenticate, async (req, res) => {
        try{
            const id = parseInt(req.params.id);
            const success = await employeeService.deleteEmployee(id);
            if(success) { 
                res.json({ message: "Employee deleted" });
            } else {
                res.status(404).json({ error: "Employee not found" });
            }
        } catch (error) {
            res.status(500).json({ error: "Error deleting employee" });
        
        }
    } );
    
export default router;