import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos de login por IP
    message: {message:"Demasiados intentos de iniciar sesión, inténtalo de nuevo más tarde"}
});

export default loginLimiter;
