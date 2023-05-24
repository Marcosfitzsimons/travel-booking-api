import { format, parse, parseISO } from "date-fns";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js'
import SpecialTrip from "../models/SpecialTrip.js"

export const createSpecialTrip = async (req, res) => {
    const newDate = new Date(req.body.date);
    const formattedDate = newDate.toISOString();
    const parseDate = parseISO(formattedDate);
    const date = format(parseDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const newSpecialTrip = new SpecialTrip({
        ...req.body,
        date: date
    })

    const savedSpecialTrip = await newSpecialTrip.save()
    console.log(savedSpecialTrip)
    res.status(StatusCodes.OK).json(savedSpecialTrip)

}

export const updateSpecialTrip = async (req, res) => {
    const updatedSpecialTrip = await SpecialTrip.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    if (!updatedSpecialTrip) throw new NotFoundError('Viaje no existe')

    res.status(StatusCodes.OK).json(updatedSpecialTrip)

}

export const deleteSpecialTrip = async (req, res) => {
    const specialTrip = await SpecialTrip.findByIdAndDelete(req.params.id)
    if (!specialTrip) throw new NotFoundError('Viaje no existe')

    res.status(StatusCodes.OK).json('Viaje ha sido eliminado.')

}

export const getSpecialTrip = async (req, res) => {

    const specialTrip = await SpecialTrip.findById(req.params.id)
    if (!specialTrip) throw new NotFoundError('Viaje no existe.')
    res.status(StatusCodes.OK).json(specialTrip)

}

export const getSpecialTrips = async (req, res) => {

    const currentDate = parse(format(new Date(), "dd/MM/yy"), "dd/MM/yy", new Date());

    const specialTrips = await SpecialTrip.find({ date: { $gte: currentDate } }).sort('date')

    res.status(StatusCodes.OK).json(specialTrips)

}