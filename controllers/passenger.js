import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js'
import Passenger from '../models/Passenger.js'
import Trip from '../models/Trip.js'
import User from '../models/User.js';



export const createPassenger = async (req, res, next) => {

    const tripId = req.params.tripid;

    if (!req.user.isAdmin) {

        req.body.createdBy = req.params.id

        const newPassenger = new Passenger(req.body)
        const savedPassenger = await newPassenger.save()

        const trip = await Trip.findById(tripId).populate('passengers');

        const isCreated = trip.passengers.find(passenger => passenger.createdBy == req.params.id)
        if (isCreated) throw new BadRequestError('Ey! Ya tenes boleto para este viaje.')

        // Push the trip to user's myTrips array

        await User.findByIdAndUpdate(req.params.id, {
            $push: { myTrips: tripId },
        });

        try {
            await Trip.findByIdAndUpdate(tripId, {
                $push: { passengers: savedPassenger },
            })
        } catch (err) {
            next(err)
        }

        res.status(StatusCodes.OK).json({ savedPassenger })

    }

    const newPassenger = new Passenger(req.body)
    const savedPassenger = await newPassenger.save()

    try {
        await Trip.findByIdAndUpdate(tripId, {
            $push: { passengers: savedPassenger },
        })
    } catch (err) {
        next(err)
    }

    res.status(StatusCodes.OK).json({ savedPassenger })
}

export const updatePassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const userId = req.params.id

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true });

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: {
            path: 'createdBy',
            model: 'User',
            select: '_id username fullName addressCda addressCapital phone dni image email'
        }
    });
    const passenger = trip.passengers.find(passenger => passenger.createdBy._id == userId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    const updatedPassenger = await Passenger.findByIdAndUpdate(passenger._id, { $set: req.body }, { new: true }).populate({
        path: 'createdBy',
        model: 'User',
        select: '_id username fullName addressCda addressCapital phone dni image email'
    })
    const passengerIndex = trip.passengers.findIndex(passenger => String(passenger.createdBy._id) === String(userId));

    trip.passengers[passengerIndex] = updatedPassenger
    console.log(updatedPassenger)
    await trip.save();
    res.status(StatusCodes.OK).json({ updatedPassenger });

}

export const deletePassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const userId = req.params.id

    const trip = await Trip.findById(tripId).populate('passengers');

    const passenger = trip.passengers.find(passenger => passenger.createdBy._id == userId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')
    await Passenger.findByIdAndDelete(passenger._id)

    trip.passengers.pull(passenger._id);
    await trip.save();

    const user = await User.findById(userId).populate('myTrips');
    const userTrip = user.myTrips.find(userTrip => userTrip._id == tripId)
    user.myTrips.pull(userTrip._id)
    await user.save();

    res.status(StatusCodes.OK).json('Pasaje cancelado con éxito.')

}

export const getPassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const userId = req.params.id

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: {
            path: 'createdBy',
            model: 'User',
            select: '_id username fullName addressCda addressCapital phone dni image email'
        }
    });
    const passenger = trip.passengers.find(passenger => passenger.createdBy._id == userId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    res.status(StatusCodes.OK).json({ passenger })

}

export const getPassengers = async (req, res, next) => {
    const tripId = req.params.tripid;

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' }
    });

    res.status(StatusCodes.OK).json({ passengers: trip.passengers })

}