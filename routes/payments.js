import express from "express";

import PaymentController from "../controllers/payment.js";
import PaymentsService from '../services/payments.js'
import Trip from '../models/Trip.js'


import { verifyUser } from "../middleware/verifyToken.js";
import BadRequestError from "../errors/bad-request.js";

const PaymentInstance = new PaymentController(new PaymentsService());

const router = express.Router();

router.post("/", async (req, res, next) => {

    const { userId } = req.body;
    const tripId = req.body.trip._id

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni addressCda addressCapital'
    });

    const existingPassenger = trip.passengers.find(passenger => passenger.createdBy?._id.toString() === userId);
    if (existingPassenger) {
        throw new BadRequestError('Ey! Ya tenes boleto para este viaje.')
    }
    PaymentInstance.getPaymentLink(req, res)

})


export default router;
