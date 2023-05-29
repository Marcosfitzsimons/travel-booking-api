import express from "express";
import { createSpecialPassenger, deleteSpecialPassenger, getSpecialPassenger, getSpecialPassengers, updateSpecialPassenger } from "../controllers/specialpassenger.js";
import { verifyAdmin, verifyUser } from '../middleware/verifyToken.js'

const router = express.Router();

// id = passenger._id
// CREATE - OK
router.post("/:tripid", verifyAdmin, createSpecialPassenger)

// UPDATE - OK
router.put("/:id/:tripid", verifyAdmin, updateSpecialPassenger)

// DELETE - OK
router.delete("/:id/:tripid", verifyAdmin, deleteSpecialPassenger)

// GET - OK
router.get("/:id/:tripid", verifyAdmin, getSpecialPassenger)

// GET ALL - OK
router.get("/:tripid", verifyAdmin, getSpecialPassengers)

export default router;