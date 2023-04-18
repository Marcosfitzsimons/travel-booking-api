import express from "express";
import { createPassenger, deletePassenger, getPassenger, getPassengers, updatePassenger } from "../controllers/passenger.js";
import { verifyAdmin, verifyUser } from '../middleware/verifyToken.js'

const router = express.Router();

// id = passenger.createdBy._id
// CREATE - OK
router.post("/:id/:tripid", verifyUser, createPassenger)

// UPDATE - OK
router.put("/:id/:tripid", verifyAdmin, updatePassenger)

// DELETE - OK
router.delete("/:id/:tripid", verifyUser, deletePassenger)

// GET - OK
router.get("/:id/:tripid", verifyUser, getPassenger)

// GET ALL - OK
router.get("/:tripid", verifyAdmin, getPassengers)

export default router;