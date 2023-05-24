import express from "express";
import { createSpecialTrip, deleteSpecialTrip, getSpecialTrip, getSpecialTrips, updateSpecialTrip } from "../controllers/specialtrip.js";
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

export default router;