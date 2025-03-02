import { Request, Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?:any;
}

export const authenticate = (req:AuthRequest, res:Response, next:NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denegado" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
};

export const verifyRole = (role:string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if(!req.user || !role.includes(req.user.role)){
            return res.status(403).json({error:"Unauthorized"});
        }
        next();
    };  
};