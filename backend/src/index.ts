import  Express  from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import  employeeRoutes from "./routes/employeeRoutes";
import "./db"; 
import authRoutes from "./routes/authRoutes";
import loginLimiter from "./middleware/loginLimiter"; 
import PoncheRoutes from "./routes/poncheRoutes";
import nominaRoutes from "./routes/nominaRoutes";
import reportRoutes from "./routes/reportRoutes";


dotenv.config();
const app = Express();
 
//CORS: Restringe quién puede acceder a la API
app.use(cors({
    origin:"*" ,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

//🔹 Helmet: Protege la API contra ataques comunes
app.use(helmet());
app.use(Express.json());

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/login",loginLimiter);
app.use("/api/ponches",PoncheRoutes);
app.use("/api/nominas", nominaRoutes);
app.use("/api/reports",reportRoutes);

app.get("/", (req, res) => {
    res.send("HR API WORKING");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});