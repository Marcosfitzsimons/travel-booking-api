import express from "express";
import { register, login, verifyUser, sendPasswordLink, forgotPassword, changePassword, refreshToken, logout } from "../controllers/auth.js";


const router = express.Router();

router.post('/login', login)
router.post('/register', register)
router.get('/logout', logout)

// refresh token
router.get('/refresh', refreshToken)

// user forgot password 
router.post('/sendpasswordlink', sendPasswordLink)
router.get("/forgotpassword/:id/:token", forgotPassword)
router.post("/changepassword/:id", changePassword)

// verify email
router.get("/confirm/:confirmationCode", verifyUser)

export default router;