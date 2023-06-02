import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js'
import Passenger from '../models/Passenger.js'
import Trip from '../models/Trip.js'
import User from '../models/User.js';



export const createPassenger = async (req, res, next) => {

    const tripId = req.params.tripid;

    const { fullName, dni, userId } = req.body;

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni'
    });

    if (req.user.isAdmin) {
        if (!fullName && !dni && !userId) {
            const newPassenger = new Passenger({});
            const savedPassenger = await newPassenger.save();

            await Trip.findByIdAndUpdate(tripId, {
                $push: { passengers: savedPassenger }
            });

            return res.status(StatusCodes.OK).json({ savedPassenger });
        } else if ((fullName && dni || fullName) && !userId) {
            // Handle case of partial passenger
            const newPassenger = new Passenger({ fullName, dni });
            const savedPassenger = await newPassenger.save();

            await Trip.findByIdAndUpdate(tripId, {
                $push: { passengers: savedPassenger }
            });

            return res.status(StatusCodes.OK).json({ savedPassenger });
        } else if (!fullName && !dni && userId) {
            // Handle case of user passenger
            const existingPassenger = trip.passengers.find(passenger => passenger.createdBy?._id.toString() === userId);
            if (existingPassenger) {
                throw new BadRequestError('Ey! Usuario ya tiene boleto para este viaje.')
            }

            const newPassenger = new Passenger({ createdBy: userId });
            const savedPassenger = await newPassenger.save();

            await User.findByIdAndUpdate(userId, {
                $push: { myTrips: tripId },
            });

            await Trip.findByIdAndUpdate(tripId, {
                $push: { passengers: savedPassenger }
            });

            return res.status(StatusCodes.OK).json({ savedPassenger });
        } else {
            throw new BadRequestError('Invalid passenger information.');
        }
    }

    req.body.createdBy = req.params.id

    const existingPassenger = trip.passengers.find(passenger => passenger.createdBy?._id.toString() === userId);
    if (existingPassenger) {
        throw new BadRequestError('Ey! Ya tenes boleto para este viaje.')
    }

    const newPassenger = new Passenger({ createdBy: userId });
    const savedPassenger = await newPassenger.save();

    // Push the trip to user's myTrips array

    await User.findByIdAndUpdate(userId, {
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

export const updatePassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const userId = req.params.id

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true });

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni'
    });
    const passenger = trip.passengers.find(passenger => passenger.createdBy._id == userId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    const updatedPassenger = await Passenger.findByIdAndUpdate(passenger._id, { $set: req.body }, { new: true }).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni'
    });
    const passengerIndex = trip.passengers.findIndex(passenger => String(passenger.createdBy._id) === String(userId));

    trip.passengers[passengerIndex] = updatedPassenger
    console.log(updatedPassenger)
    await trip.save();
    res.status(StatusCodes.OK).json({ updatedPassenger });

}


export const deletePassenger = async (req, res, next) => {
    const tripId = req.params.tripid;

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni'
    });

    if (!req.user.isAdmin) {
        const userId = req.params.id

        const passenger = trip.passengers.find(passenger => passenger.createdBy._id == userId)
        if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

        await Passenger.findByIdAndDelete(passenger.createdBy._id)
        trip.passengers.pull(passenger.createdBy._id);

        await trip.save();

        const user = await User.findById(userId).populate('myTrips');
        const userTrip = user.myTrips.find(userTrip => userTrip._id == tripId)
        user.myTrips.pull(userTrip._id)
        await user.save();

        res.status(StatusCodes.OK).json('Pasaje cancelado con éxito.')


    }

    const passenger = trip.passengers.find(passenger => passenger._id == req.params.id)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    await Passenger.findByIdAndDelete(passenger._id)
    trip.passengers.pull(passenger._id);

    await trip.save();

    res.status(StatusCodes.OK).json('Pasaje cancelado con éxito.')

}

export const getPassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const userId = req.params.id

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni'
    });

    const passenger = trip.passengers.find(passenger => passenger.createdBy?._id.toString() === userId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    res.status(StatusCodes.OK).json({ passenger })

}

export const getPassengers = async (req, res, next) => {
    const tripId = req.params.tripid;

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni'
    });

    res.status(StatusCodes.OK).json({ passengers: trip.passengers })

}