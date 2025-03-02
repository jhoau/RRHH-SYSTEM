import pool from "../db";
import { Employee } from "../models/Employee";

class EmployeeService {

      //Obtener  todos empleados

      async getAllEmployees(): Promise<Employee[]> {
        const result = await pool.query("SELECT * FROM employees");
        return result.rows;
}

      //Obtener   empleados por ID

     async getEmployeeById(id:number):Promise<Employee | null>{
     const result = await pool.query("SELECT * FROM employees WHERE id = $1", [id]);
      return result.rows[0] || null;
}
     //Agregar un nuevo empleado
 async addEmployee(employee: Employee): Promise<Employee> {
    try {
        const { cedula, fullname, price_per_hour } = employee;
        const result = await pool.query(
            "INSERT INTO employees (cedula, fullname,  price_per_hour) VALUES ($1, $2, $3) RETURNING *", 
            [cedula, fullname, price_per_hour]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error adding employee:", error);
        throw error; 
    }
}
        //Actualizar un  empleado
     async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | null> {
        const {fullname,price_per_hour} = employee;
        const result = await pool.query("UPDATE employees SET fullname = $1,  price_per_hour = $2 WHERE id = $3 RETURNING *", [fullname, price_per_hour, id]);
        return result.rows[0] || null;
     }
        //Borrar un empleado
        async deleteEmployee(id: number): Promise<boolean> {
            const result = await pool.query("DELETE FROM employees WHERE id = $1", [id]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        async getEmployeeByCedula(cedula: string): Promise<Employee | null> {
            const result = await pool.query("SELECT * FROM employees WHERE cedula = $1", [cedula]);
            return result.rows[0] || null;
        }
}

export default new EmployeeService();