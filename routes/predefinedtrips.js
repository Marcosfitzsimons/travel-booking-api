import express from "express";
import { verifyAdmin } from "../middleware/verifyToken.js";
import { addTripToPredefinedDay, createPredefinedTrip, deletePredefinedTripsForDay, deleteTripFromPredefinedDay, getAllPredefinedTrips, getPredefinedTripsForDay, updatePredefinedTripsForDay, updateTripInPredefinedDay } from "../controllers/predefinedtrips.js";

const router = express.Router();

router.get("/", verifyAdmin, getAllPredefinedTrips)
router.get("/:dayOfWeek", verifyAdmin, getPredefinedTripsForDay)

router.post('/', verifyAdmin, createPredefinedTrip);
router.put('/:dayOfWeek', verifyAdmin, updatePredefinedTripsForDay);
router.delete('/:dayOfWeek', verifyAdmin, deletePredefinedTripsForDay);

router.post('/new-predefined-trip/:dayOfWeek', verifyAdmin, addTripToPredefinedDay);

router.put('/:dayOfWeek/:tripId', verifyAdmin, updateTripInPredefinedDay);
router.delete('/:dayOfWeek/:tripId', verifyAdmin, deleteTripFromPredefinedDay);


export default router;
