import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js'
import Passenger from '../models/Passenger.js'
import Trip from '../models/Trip.js'
import User from '../models/User.js';


export const createPassenger = async (req, res, next) => {

    const tripId = req.params.tripid;

    const { fullName, dni, addressCda, addressCapital, isPaid, userId } = req.body;

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni addressCda addressCapital isPaid'
    });

    if (req.user.isAdmin) {
        if (!fullName && !dni && !addressCda && !addressCapital && !userId) {
            const newPassenger = new Passenger({});
            const savedPassenger = await newPassenger.save();

            await Trip.findByIdAndUpdate(tripId, {
                $push: { passengers: savedPassenger }
            });

            return res.status(StatusCodes.OK).json({ savedPassenger });
        } else if (fullName || dni || addressCda || addressCapital && !userId) {
            // Handle case of partial passenger
            const newPassenger = new Passenger({ fullName, dni, addressCda, addressCapital });
            const savedPassenger = await newPassenger.save();

            await Trip.findByIdAndUpdate(tripId, {
                $push: { passengers: savedPassenger }
            });

            return res.status(StatusCodes.OK).json({ savedPassenger });
        } else if (!fullName && !dni && !addressCda && !addressCapital && userId) {
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

    const newPassenger = new Passenger({ createdBy: userId, isPaid: isPaid });
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

// admin: check
export const updatePassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const passengerId = req.params.id

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni addressCda addressCapital isPaid'
    });

    const passenger = trip.passengers.find(passenger => String(passenger._id) === String(passengerId))
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    const updatedPassenger = await Passenger.findByIdAndUpdate(passenger._id, { $set: req.body }, { new: true })

    const passengerIndex = trip.passengers.findIndex(passenger => String(passenger._id) === String(passengerId));

    trip.passengers[passengerIndex] = updatedPassenger
    console.log(updatedPassenger)
    await trip.save();
    res.status(StatusCodes.OK).json({ updatedPassenger });

}

export const deletePassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const userId = req.params.id

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni addressCda addressCapital'
    });
    if (!req.user.isAdmin) {
        const passenger = trip.passengers.find(passenger => String(passenger.createdBy._id) === String(userId))
        if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

        await Passenger.findByIdAndDelete(passenger._id)
        trip.passengers.pull(passenger._id);

        await trip.save();

        const user = await User.findById(userId).populate('myTrips');
        if (!user) throw new NotFoundError('Usuario no encontrado.')

        const userTrip = user.myTrips.find(userTrip => String(userTrip._id) === String(tripId))
        user.myTrips.pull(userTrip._id)
        await user.save();

        res.status(StatusCodes.OK).json('Pasaje cancelado con éxito.')

    }

    const user = await User.findById(userId).populate('myTrips');
    if (!user) {
        const passenger = trip.passengers.find(passenger => String(passenger._id) === String(userId))
        if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

        await Passenger.findByIdAndDelete(passenger._id)
        trip.passengers.pull(passenger._id);

        res.status(StatusCodes.OK).json('Pasaje cancelado con éxito.')
    } else {
        const passenger = trip.passengers.find(passenger => String(passenger.createdBy?._id) === String(userId))
        if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')
        await Passenger.findByIdAndDelete(passenger._id)
        trip.passengers.pull(passenger._id);
        await trip.save()
        const userTrip = user.myTrips.find(userTrip => String(userTrip._id) === String(tripId))

        user.myTrips.pull(userTrip._id)
        await user.save();

        res.status(StatusCodes.OK).json('Pasaje cancelado con éxito.')
    }

}

export const getPassenger = async (req, res, next) => {
    const tripId = req.params.tripid;

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni addressCda addressCapital isPaid'
    });

    if (req.user.isAdmin) {
        const passengerId = req.params.id

        const passenger = trip.passengers.find(passenger => passenger._id.toString() === passengerId)
        if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

        res.status(StatusCodes.OK).json({ passenger })

    } else {
        const userId = req.params.id

        const passenger = trip.passengers.find(passenger => passenger.createdBy?._id.toString() === userId)
        if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

        res.status(StatusCodes.OK).json({ passenger })
    }


}

export const getPassengers = async (req, res, next) => {
    const tripId = req.params.tripid;

    const trip = await Trip.findById(tripId).populate({
        path: 'passengers',
        populate: { path: 'createdBy', select: '_id username fullName addressCda addressCapital phone dni image email' },
        select: 'fullName dni addressCda addressCapital isPaid'
    });

    res.status(StatusCodes.OK).json({ passengers: trip.passengers })

}