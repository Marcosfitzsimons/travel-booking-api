import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js'
import SpecialPassenger from '../models/SpecialPassenger.js'
import SpecialTrip from '../models/SpecialTrip.js'
import User from '../models/User.js';

export const createSpecialPassenger = async (req, res, next) => {
    const tripId = req.params.tripid;

    const newSpecialPassenger = new SpecialPassenger(req.body)

    const savedSpecialPassenger = await newSpecialPassenger.save()
    try {
        await SpecialTrip.findByIdAndUpdate(
            tripId,
            {
                $push: { passengers: savedSpecialPassenger._id }, // Use the ObjectId of the savedSpecialPassenger
            },
            { new: true } // Set the option { new: true } to return the updated document
        );

    } catch (err) {
        next(err)
    }

    res.status(StatusCodes.OK).json({ savedSpecialPassenger })
}

export const updateSpecialPassenger = async (req, res, next) => {

    const tripId = req.params.tripid;
    const passengerId = req.params.id

    const specialTrip = await SpecialTrip.findById(tripId).populate({
        path: 'passengers'
    });

    const passenger = specialTrip.passengers.find(passenger => passenger._id == passengerId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    const updatedPassenger = await SpecialPassenger.findByIdAndUpdate(passenger._id, { $set: req.body }, { new: true })

    const passengerIndex = specialTrip.passengers.findIndex(passenger => String(passenger._id) === String(passengerId));

    specialTrip.passengers[passengerIndex] = updatedPassenger
    console.log(updatedPassenger)
    await specialTrip.save();
    res.status(StatusCodes.OK).json({ updatedPassenger });

}

export const deleteSpecialPassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const passengerId = req.params.id

    const specialTrip = await SpecialTrip.findById(tripId).populate('passengers');

    const passenger = specialTrip.passengers.find(passenger => passenger._id == passengerId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')
    await SpecialPassenger.findByIdAndDelete(passenger._id)

    specialTrip.passengers.pull(passenger._id);
    await specialTrip.save();

    res.status(StatusCodes.OK).json('Pasaje cancelado con éxito.')

}

export const getSpecialPassenger = async (req, res, next) => {
    const tripId = req.params.tripid;
    const passengerId = req.params.id

    const specialTrip = await SpecialTrip.findById(tripId).populate("passengers")
    const passenger = specialTrip.passengers.find(passenger => passenger._id == passengerId)
    if (!passenger) throw new NotFoundError('Pasajero no existe en este viaje.')

    res.status(StatusCodes.OK).json({ passenger })

}

export const getSpecialPassengers = async (req, res, next) => {
    const tripId = req.params.tripid;

    const specialTrip = await SpecialTrip.findById(tripId).populate("passengers")

    res.status(StatusCodes.OK).json({ passengers: specialTrip.passengers })

}