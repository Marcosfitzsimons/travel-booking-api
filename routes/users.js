import express from "express";
import { deleteUser, getUser, getUserAddresses, getUserTrips, getUsers, handleChangePassword, updateAdminProfile, updateUser, updateUserAddresses, updateUserStatus } from "../controllers/user.js";
import { verifyAdmin, verifyUser } from "../middleware/verifyToken.js";

const router = express.Router();

// UPDATE  
router.put("/:id", verifyUser, updateUser)

// UPDATE STATUS
router.put("/:id/status", verifyAdmin, updateUserStatus)

// UPDATE ADDRESSES
router.put("/addresses/:id", verifyUser, updateUserAddresses)

// UPDATE ADMIN PROFILE
router.put("/admin/:id", verifyAdmin, updateAdminProfile)

// CHANGE PASSWORD
router.put("/changepassword/:id", verifyUser, handleChangePassword)

// DELETE
router.delete("/:id", verifyUser, deleteUser)

// GET
router.get("/:id", verifyUser, getUser)

// GET ADDRESSES
router.get("/addresses/:id", verifyUser, getUserAddresses)

// GET TRIPS
router.get("/trips/:id", verifyUser, getUserTrips)


// GET ALL
router.get("/", verifyAdmin, getUsers)

export default router;