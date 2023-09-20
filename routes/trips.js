import express from "express";
import { createTrip, deleteTrip, getIncomes, getMonthlyIncomes, getRecentIncomes, getTrip, getTrips, updateTrip } from "../controllers/trip.js";
import { verifyAdmin, verifyUser } from '../middleware/verifyToken.js'

const router = express.Router();

// CREATE
router.post("/", verifyAdmin, createTrip)

// UPDATE
router.put("/:id", verifyAdmin, updateTrip)

// DELETE
router.delete("/:id", verifyAdmin, deleteTrip)

// GET
router.get("/:userId/:tripId", getTrip)

// GET INCOMES
// For now public
router.get("/incomes", verifyAdmin, getIncomes)
router.get("/recentIncomes", verifyAdmin, getRecentIncomes)
router.get("/incomes/:year/:month", verifyAdmin, getMonthlyIncomes)

// GET ALL
router.get("/", getTrips)

export default router;