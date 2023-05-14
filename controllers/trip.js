import { format, parse, parseISO } from "date-fns";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js'
import Trip from "../models/Trip.js"

export const createTrip = async (req, res) => {
    const newDate = new Date(req.body.date);
    const formattedDate = newDate.toISOString();
    const parseDate = parseISO(formattedDate);
    const date = format(parseDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const newTrip = new Trip({
        ...req.body,
        date: date
    })

    const savedTrip = await newTrip.save()
    console.log(savedTrip)
    res.status(StatusCodes.OK).json(savedTrip)

}

export const updateTrip = async (req, res) => {
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    if (!updatedTrip) throw new NotFoundError('Viaje no existe')

    res.status(StatusCodes.OK).json(updatedTrip)

}

export const deleteTrip = async (req, res) => {
    const trip = await Trip.findByIdAndDelete(req.params.id)
    if (!trip) throw new NotFoundError('Viaje no existe')

    res.status(StatusCodes.OK).json('Viaje ha sido eliminado.')

}


export const getTrip = async (req, res) => {

    const trip = await Trip.findById(req.params.id).populate({
        path: 'passengers',
        populate: {
            path: 'createdBy',
            select: '_id username fullName addressCda addressCapital dni phone image email'
        }
    })
    if (!trip) throw new NotFoundError('Viaje no existe.')
    res.status(StatusCodes.OK).json(trip)

}

export const getTrips = async (req, res) => {
    // See the time of the current date -> Must be UTC-3
    // const formattedCurrentDate = new Date(currentDate);

    const currentDate = parse(format(new Date(), "dd/MM/yy"), "dd/MM/yy", new Date());

    // const filteredMyTrips = user.myTrips.filter(trip => new Date(trip.date) >= formattedCurrentDate)
    // console.log(filteredMyTrips)

    const trips = await Trip.find({ date: { $gte: currentDate } }).sort('date')

    res.status(StatusCodes.OK).json(trips)

}
