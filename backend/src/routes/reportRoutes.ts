import  express  from "express";
import ReportService from "../services/reportService";
import { authenticate } from "../middleware/authMiddleware";
import { verifyRole } from "../middleware/authMiddleware";
import reportService from "../services/reportService";

const router = express.Router();

//🔵 Descargar Reporte en Excel (Solo Admin y Gerentes)

  router.get("/excel", authenticate,verifyRole(["manager", "director"]), async (req,res) =>{
    try {
        const filePath = await reportService.generarExcel();

        res.download(filePath);

    } catch (error) {
        res.status(500).json({error:(error as Error).message});
    }
  });

  // 🔵 Descargar Reporte en PDF (Solo Admin y Gerentes)
    router.get("/pdf", authenticate,verifyRole(["manager", "director"]), async (req,res) =>{
        try{
            const filePath = await reportService.generarPDF();
            res.download(filePath);

        }catch (error){
            res.status(500).json({error:(error as Error).message});
        }
    });

    export default router;