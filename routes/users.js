import express from "express";
import { deleteUser, getUser, getUserAddresses, getUsers, updateUser, updateUserAddresses, updateUserStatus } from "../controllers/user.js";
import { verifyAdmin, verifyUser } from "../middleware/verifyToken.js";

const router = express.Router();

// UPDATE USER STATUS

router.put("/:id/status", verifyAdmin, updateUserStatus)

// UPDATE  
router.put("/:id", verifyUser, updateUser)

// UPDATE
router.put("/addresses/:id", verifyUser, updateUserAddresses)

// DELETE
router.delete("/:id", verifyUser, deleteUser)

// GET
router.get("/:id", verifyUser, getUser)

// GET
router.get("/addresses/:id", verifyUser, getUserAddresses)


// GET ALL
router.get("/", verifyAdmin, getUsers)

export default router;