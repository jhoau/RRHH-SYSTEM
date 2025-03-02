import express from "express";
import PoncheService from "../services/PoncheService";
import { authenticate } from "../middleware/authMiddleware";
import { verifyRole } from "../middleware/authMiddleware";

const router = express.Router();

// 🟢 Clock in Registration (all employees can)
router.post("/:empleado_id", authenticate, async (req, res) => {
    try {
        const { empleado_id } = req.params;
        const ponche = await PoncheService.clockInRegistration(parseInt(empleado_id));
        res.json(ponche);
    } catch (error) {
        res.status(500).json({ error: "Error al registrar entrada" });
    }
});

// 🟢 Clock out  Registration
router.put("/:ponche_id/salida", authenticate, async (req, res) => {
    try {
        const { ponche_id } = req.params;
        const ponche = await PoncheService.clockOutRegistration(parseInt(ponche_id));
        res.json(ponche);
    } catch (error) {
        res.status(500).json({ error: "Error al registrar salida" });
    }
});


// 🟢 Get all ponches
router.get("/", authenticate, verifyRole(["manager", "director"]), async (req, res) => {
    try {
        const ponches = await PoncheService.getAllPonches();
        res.json(ponches);
    } catch (error) {
        console.error("Error fetching punch history:", error);
        res.status(500).json({ error: "Error obteniendo historial de ponches" });
    }
});

// 🟢 Get employee's ponches 
router.get("/employee/:empleado_id", authenticate, async (req, res) => {
    try {
        const { empleado_id } = req.params;
        const ponches = await PoncheService.getPonchesPerEmployee(parseInt(empleado_id));
        res.json(ponches);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los ponches del Empleado" });
    }
});

// 🔴 Update ponche (Only  Managers or admin)
router.put("/:ponche_id", authenticate, verifyRole(["manager", "director"]), async (req, res) => {
    try {
        const { ponche_id } = req.params;
        const { fecha_entrada, fecha_salida } = req.body;
        const ponche = await PoncheService.updatePonche(parseInt(ponche_id), fecha_entrada, fecha_salida);
        res.json(ponche);
    } catch (error) {
        res.status(500).json({ error: "Error al editar ponche" });
    }
});

export default router;
