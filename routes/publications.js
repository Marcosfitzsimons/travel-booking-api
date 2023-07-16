import express from "express";
import { deletePublication, getPublication, getPublications, updatePublication, createPublication } from "../controllers/publication.js";
import { verifyAdmin, verifyUser } from "../middleware/verifyToken.js";

const router = express.Router();

// CREATE
router.post("/", verifyAdmin, createPublication)

// UPDATE  
router.put("/:id", verifyAdmin, updatePublication)

// DELETE
router.delete("/:id", verifyAdmin, deletePublication)

// GET
router.get("/:id", verifyAdmin, getPublication)

// GET ALL
router.get("/", verifyUser, getPublications)

export default router;