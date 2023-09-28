import { format, parse, parseISO } from "date-fns";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js'
import SpecialTrip from "../models/SpecialTrip.js"
import createNewSpecialPassengers from "../services/specialPassengerService.js";

export const createSpecialTrip = async (req, res) => {
    const { add_passengers, default_passenger_count, maxCapacity } = req.body;
    const newDate = new Date(req.body.date);
    const formattedDate = newDate.toISOString();
    const parseDate = parseISO(formattedDate);
    const date = format(parseDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const newSpecialTrip = new SpecialTrip({
        ...req.body,
        date: date
    })

    const savedSpecialTrip = await newSpecialTrip.save()

    if (add_passengers) {

        if (default_passenger_count) {
            const passengerCount = Math.min(default_passenger_count, maxCapacity - 1);
            const newPassengers = await createNewSpecialPassengers(passengerCount);
            savedSpecialTrip.passengers.push(...newPassengers);
        }

        await savedSpecialTrip.save();
    }

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

    const specialTrip = await SpecialTrip.findById(req.params.id).populate("passengers")
    if (!specialTrip) throw new NotFoundError('Viaje no existe.')
    res.status(StatusCodes.OK).json(specialTrip)

}

export const getSpecialTrips = async (req, res) => {

    const currentDate = parse(format(new Date(), "dd/MM/yy"), "dd/MM/yy", new Date());

    const specialTrips = await SpecialTrip.find({ date: { $gte: currentDate } }).sort('date')

    res.status(StatusCodes.OK).json(specialTrips)

}

export const getSpecialIncomes = async (req, res) => {
    const trips = await SpecialTrip.find().sort({ date: 1 });
    if (!trips) throw new NotFoundError('Error al obtener ganancias en viajes particulares')

    const incomes = trips.map(trip => (
        {
            _id: trip._id,
            date: trip.date,
            special: true,
            incomes: (trip.price * trip.passengers.length),
        }
    ))

    res.status(StatusCodes.OK).json(incomes)
}

export const getSpecialMonthlyIncomes = async (req, res) => {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed
    const endDate = new Date(year, month, 0); // Get the last day of the month

    const trips = await SpecialTrip.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({ date: 1 });

    if (!trips) throw new NotFoundError('No se han encontrado viajes para el mes seleccionado');
    if (trips.length === 0) throw new NotFoundError("No se han encontrado viajes para el mes seleccionado")

    const filteredIncomes = trips.filter(trip => trip.price * trip.passengers.length > 0)

    const incomes = filteredIncomes.map(trip => ({
        _id: trip._id,
        date: trip.date,
        name: trip.name,
        special: false,
        incomes: trip.price * trip.passengers.length,
    }));

    res.status(StatusCodes.OK).json(incomes);
};
