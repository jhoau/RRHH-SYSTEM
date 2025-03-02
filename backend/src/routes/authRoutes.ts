import  Express, { Request, Response }  from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import {body,validationResult} from "express-validator"
import loginLimiter from "../middleware/loginLimiter";


const router = Express.Router();




// 📌 Registro de usuario con validación

router.post("/register",[
    body("cedula").isLength({min:5}).withMessage("El id debe tener al menos 5 caracteres"),
    body("password").isLength({min:6}).withMessage("La contraseña debe tene al menos 6 caracteres")
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const{cedula, password, role} = req.body;
    try {


        //  encryptacion de contraseña 
        
          const hashedPassword = await bcrypt.hash(password, 10);
           const result = await pool.query(
            "INSERT INTO users (cedula, password, role) VALUES ($1, $2, $3) RETURNING id, cedula, role",
            [cedula, hashedPassword, role || "employee"]
        );
        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({error: "Error al registrar el usuario"});
    }
});


    // login de ususario

     router.post("/login",loginLimiter,[
        body("cedula").notEmpty().withMessage("Campo cedula es mandatorio"),
        body("password").notEmpty().withMessage("La contraseña es requerida")
     ], async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }
        const {cedula, password} = req.body;
        try {
            const result = await pool.query("SELECT * FROM users WHERE cedula = $1", [cedula]);
            if (result.rowCount === 0) {
                return res.status(400).json({ error: "Usuario no encontrado" });

            }
            const user = result.rows[0];

    //Compare passwords

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

    //Create token

            const token = jwt.sign({id:user.id, cedula: user.cedula, role: user.role}, process.env.JWT_SECRET as string,{expiresIn:"1h"});
            
            res.json({token});
        
        } catch (error) {
            res.status(500).json({error: "Error logging in"});
        }
        
    }); 
       
    export default router;