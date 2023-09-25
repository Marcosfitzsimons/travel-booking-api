import express from "express";
import { createTrip, deleteTrip, getIncomes, getMonthlyIncomes, getTrip, getTrips, updateTrip } from "../controllers/trip.js";
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

// GET ALL
router.get("/", getTrips)

// GET INCOMES
router.get("/incomes", verifyAdmin, getIncomes)

router.get("/monthly-incomes/:year/:month", verifyAdmin, getMonthlyIncomes)

// ADD YEARLY INCOMES

export default router;