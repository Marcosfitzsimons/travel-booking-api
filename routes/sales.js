import express from "express";
import { getSales } from "../controllers/sale.js";
import { verifyAdmin } from '../middleware/verifyToken.js'

const router = express.Router();

router.get("/", verifyAdmin, getSales)

export default router;