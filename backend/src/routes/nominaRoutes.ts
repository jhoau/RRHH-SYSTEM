import  Express from "express";
import nominaService from "../services/nominaService";
import { authenticate } from "../middleware/authMiddleware";
import { verifyRole } from "../middleware/authMiddleware";

const router = Express.Router();

//🔵 Calcular y generar nómina (solo gerentes y directores pueden)

router.post ("/:empleado_id",authenticate,verifyRole(["manager", "director"]), async(req,res) =>{
    try {

        const {empleado_id} = req.params;
        const nomina = await nominaService.obtenerNomina(parseInt(empleado_id));
        res.json(nomina);
    } catch (error) {

         res.status(500).json({error:(error as Error).message});
    }
});

// 🔵 Obtener la nómina de un empleado

router.get("/:empleado_id", authenticate, async(req,res) =>{
    try{
        const {empleado_id} = req.params;
        const nomina = await nominaService.obtenerNomina(parseInt(empleado_id));
        res.json(nomina);
    }catch(error){
        res.status(500).json({error:"Error to obtain employee Paystub"});
    }
});

export default router;