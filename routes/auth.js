import express from "express";
import { register, login, verifyUser } from "../controllers/auth.js";


const router = express.Router();

router.post('/login', login)
router.post('/register', register)
router.get("/confirm/:confirmationCode", verifyUser)

export default router;