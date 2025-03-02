import pool from  "../db"
import ExcelJS from "exceljs";
import PDFDocument, { fontSize } from "pdfkit";
import fs from "fs";
import path from "path";
import exp from "constants";

const reportsDir = path.join(__dirname, "../../reports");
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
}

class ReportService{

    /// 🔵 Generar Reporte en Excel

    async generarExcel(): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Nomina");

        //Agregar encabezados
        sheet.columns = [
            { header: "Empleado ID", key: "empleado_id", width: 15 },
            { header: "Salario Base", key: "salario_base", width: 15 },
            { header: "Horas Trabajadas", key: "horas_trabajadas", width: 20 },
            { header: "Horas Extras", key: "horas_extras", width: 15 },
            { header: "Monto Extras", key: "monto_extras", width: 15 },
            { header: "Total Pago", key: "total_pago", width: 15 },
            { header: "Fecha Generación", key: "fecha_generacion", width: 20 }
        ];

        //Obtener datos desde la Base de datos

        const result = await pool.query("SELECT * FROM nominas");

        //Agregar datos al excel
        result.rows.forEach(row => sheet.addRow(row));


        //Guardar archivo
        const filePath = path.join(reportsDir,"nomina.xlsx");
        await workbook.xlsx.writeFile(filePath);
        return filePath;

    }
        // 🔵 Generar Reporte en PDF
        async generarPDF(): Promise<string> {
            const doc = new PDFDocument();
            const filePath = path.join(reportsDir,"nomina.pdf");
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            doc.fontSize(18).text("Reporte de Nomina" , {align:"center"});
            doc.moveDown();

            //Obtener datos desde la base de datos
            const result = await pool.query
            ("SELECT * FROM nominas");

            result.rows.forEach(row =>{
                doc.fontSize(12).text(
                    `Empleado ID: ${row.empleado_id} | Salario Base: $${row.salario_base} | Horas Trabajadas: ${row.horas_trabajadas} | Horas Extras: ${row.horas_extras} | Total Pago: $${row.total_pago}`
                );
                doc.moveDown();
            });

            doc.end();
            return filePath;

        }
}

export default new ReportService();