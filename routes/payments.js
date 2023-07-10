import express from "express";

import PaymentController from "../controllers/payment.js";
import PaymentsService from '../services/payments.js'

import { verifyUser } from "../middleware/verifyToken.js";

const PaymentInstance = new PaymentController(new PaymentsService());

const router = express.Router();

router.post("/", (req, res, next) => {
    PaymentInstance.getPaymentLink(req, res)
})


export default router;
