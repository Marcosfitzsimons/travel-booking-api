import express from "express";
import { createPassenger, deletePassenger, getPassenger, getPassengers, updatePassenger } from "../controllers/passenger.js";
import { verifyAdmin, verifyUser } from '../middleware/verifyToken.js'

const router = express.Router();

// if (isAdmin) id = passenger._id
// if (!isAdmin) id = passenger.createdBy._id

// CREATE - WORKS - ADMIN/USER
router.post("/:id/:tripid", verifyUser, createPassenger)

// UPDATE 
router.put("/:id/:tripid", verifyAdmin, updatePassenger)

// DELETE - WORKS - ADMIN/USER
router.delete("/:id/:tripid", verifyUser, deletePassenger)

// GET - WORKS
router.get("/:id/:tripid", verifyUser, getPassenger)

// GET ALL - WORKS
router.get("/:tripid", verifyAdmin, getPassengers)

export default router;