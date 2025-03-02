import pool from "../db";

class nominaService{

    //Calcular la nomina de un Empleado

    async calcularNomina(empleado_id:number){

    //Obtener el precio por hora del empleado
          
    const empleadoResult = await pool.query("SELECT price_per_hour FROM employees WHERE id=$1",[empleado_id]);
     if (empleadoResult.rowCount ===0) {
        throw new Error("Employee not found");
     }
     const pricePerHour = parseFloat(empleadoResult.rows[0].price_per_hour);

     //Obtener las horas trabajadas
     const horasResult = await pool.query(
        "SELECT COUNT(*) AS horas_trabajadas FROM ponches WHERE empleado_id=$1 AND fecha_salida IS NOT  NULL",
              [empleado_id]   
     );
        const horasTrabajadas = parseInt(horasResult.rows[0].horas_trabajadas) || 0;

        //Calcular Horas extras (se pagan 35% mas)

        const horasNormales = Math.min(horasTrabajadas,40); // Máximo 40 horas normales por semana

        const horasExtras =  Math.max(0,horasTrabajadas - 40);

        const montoExtras = horasExtras *(pricePerHour * 1.35);

        //Calcular Salario base y total

        const salarioBase = horasNormales * pricePerHour;
        const totalPago = salarioBase + montoExtras;

        //Guardar en la base de datos 
          
        const result = await pool.query(
            "INSERT INTO nominas (empleado_id,salario_base,horas_trabajadas,horas_extras,monto_extras,total_pago) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [empleado_id,salarioBase,horasTrabajadas,horasExtras,montoExtras,totalPago]
                   
        );
           
        return result.rows[0];
            }
             //Obtener la nomina de un empleado

        async obtenerNomina(empleado_id:number){
            const result = await pool.query
            ("SELECT * FROM nominas WHERE empleado_id = $1", [empleado_id]);
            return result.rows;
        }

}

export default new nominaService();