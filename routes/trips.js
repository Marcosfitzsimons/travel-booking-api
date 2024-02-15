import express from "express";
import { createTrip, deleteTrip, getMonthlyIncomes, getTrip, getTrips, getYearlyIncomes, updateTrip, getTripsHistory } from "../controllers/trip.js";
import { verifyAdmin } from '../middleware/verifyToken.js'

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

// TRIPS HISTORY
router.get("/history", getTripsHistory)

// INCOMES
router.get("/monthly-incomes/:year/:month", verifyAdmin, getMonthlyIncomes)
router.get("/:year", verifyAdmin, getYearlyIncomes)


export default router;