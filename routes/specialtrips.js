import express from "express";
import { createSpecialTrip, deleteSpecialTrip, getSpecialIncomes, getSpecialMonthlyIncomes, getSpecialTrip, getSpecialTrips, updateSpecialTrip } from "../controllers/specialtrip.js";
import { verifyAdmin } from '../middleware/verifyToken.js'

const router = express.Router();

// CREATE
router.post("/", verifyAdmin, createSpecialTrip)

// UPDATE
router.put("/:id", verifyAdmin, updateSpecialTrip)

// DELETE
router.delete("/:id", verifyAdmin, deleteSpecialTrip)

// GET
router.get("/:id", verifyAdmin, getSpecialTrip)

// GET ALL
router.get("/", verifyAdmin, getSpecialTrips)

// GET INCOMES
router.get("/incomes", verifyAdmin, getSpecialIncomes)

router.get("/monthly-incomes/:year/:month", verifyAdmin, getSpecialMonthlyIncomes)

// ADD YEARLY INCOMES

export default router;