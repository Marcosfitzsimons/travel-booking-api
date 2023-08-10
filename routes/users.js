import express from "express";
import { deleteUser, getUser, getUsers, updateUser, updateUserStatus } from "../controllers/user.js";
import { verifyAdmin, verifyUser } from "../middleware/verifyToken.js";

const router = express.Router();

// UPDATE USER STATUS

router.put("/:id/status", verifyAdmin, updateUserStatus)

// UPDATE  
router.put("/:id", verifyUser, updateUser)

// DELETE
router.delete("/:id", verifyUser, deleteUser)

// GET
router.get("/:id", verifyUser, getUser)

// GET ALL
router.get("/", verifyAdmin, getUsers)

export default router;