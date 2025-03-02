import pool from "../db";

class PoncheService{

    //Clock in

    async clockInRegistration(empleado_id:number){
        const result = await pool.query(
            "INSERT INTO ponches (empleado_id) VALUES ($1) RETURNING *",
            [empleado_id]
        );

        return result.rows[0];
    };

     //Clock out
     async clockOutRegistration(ponche_id:number){
        const result = await pool.query(
            "UPDATE ponches SET fecha_salida = NOW() WHERE ID = $1 RETURNING *",
            [ponche_id]
        );
        return result.rows[0];
     }

      //Obtener todos los ponches de los empleados

      async getPonchesPerEmployee(empleado_id:number){
        const result = await pool.query(
            "SELECT * FROM ponches WHERE empleado_id = $1",
            [empleado_id]
        );
        return result.rows;
      }

      async getAllPonches() {
        const result = await pool.query(`
            SELECT p.id, e.fullname, e.cedula, p.fecha_entrada, p.fecha_salida
FROM ponches p 
JOIN employees e ON p.empleado_id = e.id 
ORDER BY p.fecha_entrada DESC
        `);
        return result.rows;
    }


      //Actualizar Ponches (Solo Managers y Directores)

      async updatePonche(ponche_id:number,fecha_entrada:string,fecha_salida:string){
        const result = await pool.query(
            "UPDATE ponches SET fecha_entrada = $1, fecha_salida= $2 where id = $3 RETURNING *",
            [fecha_entrada,fecha_salida,ponche_id]
        );

        return result.rows[0];
      }
}

export default new PoncheService();
    