import { format, parse, parseISO } from "date-fns";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js'
import Trip from "../models/Trip.js"
import User from "../models/User.js"
import SpecialTrip from "../models/SpecialTrip.js";

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

    const tripPopulated = await updatedTrip.populate({
        path: 'passengers',
        populate: {
            path: 'createdBy',
            select: '_id username fullName addressCda addressCapital dni phone image email',
        },
        select: 'fullName dni addressCda addressCapital isPaid',
    })
    res.status(StatusCodes.OK).json(tripPopulated);

}

export const deleteTrip = async (req, res) => {
    const trip = await Trip.findByIdAndDelete(req.params.id)
    if (!trip) throw new NotFoundError('Viaje no existe')

    res.status(StatusCodes.OK).json('Viaje ha sido eliminado.')

}

export const getTrip = async (req, res) => {
    const { userId, tripId } = req.params

    const user = await User.findById(userId)
    if (!user) throw new NotFoundError('Usuario no encontrado')

    const trip = await Trip.findById(tripId);
    if (!trip) throw new NotFoundError('Viaje no existe.')

    if (user.isAdmin) {

        const tripPopulated = await trip.populate({
            path: 'passengers',
            populate: {
                path: 'createdBy',
                select: '_id username fullName addressCda addressCapital dni phone image email',
            },
            select: 'fullName dni addressCda addressCapital isPaid',
        })
        res.status(StatusCodes.OK).json(tripPopulated);

    } else {

        res.status(StatusCodes.OK).json(trip);
    }

}

export const getTrips = async (req, res) => {
    // See the time of the current date -> Must be UTC-3
    // const formattedCurrentDate = new Date(currentDate);

    const currentDate = parse(format(new Date(), "dd/MM/yy"), "dd/MM/yy", new Date());

    // const filteredMyTrips = user.myTrips.filter(trip => new Date(trip.date) >= formattedCurrentDate)
    // console.log(filteredMyTrips)

    const trips = await Trip.find({ date: { $gte: currentDate } }).sort('date')
    if (!trips) throw new NotFoundError('Error al obtener viajes')

    res.status(StatusCodes.OK).json(trips)

}

export const getIncomes = async (req, res) => {
    const trips = await Trip.find().sort({ date: 1 });
    if (!trips) throw new NotFoundError('Error al obtener ganancias en viajes semanales')

    const incomes = trips.map(trip => (
        {
            _id: trip._id,
            date: trip.date,
            incomes: (trip.price * trip.passengers.length),
            special: false,
        }
    ))

    res.status(StatusCodes.OK).json(incomes)
}

export const getMonthlyIncomes = async (req, res) => {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed
    const endDate = new Date(year, month, 0); // Get the last day of the month

    const trips = await Trip.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({ date: 1 });

    const specialTrips = await SpecialTrip.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({ date: 1 });

    if (!trips) throw new NotFoundError('No se han encontrado viajes para el mes seleccionado');
    if (trips.length === 0) throw new NotFoundError("No se han encontrado viajes para el mes seleccionado")

    let specialIncomes = []
    if (specialTrips && specialTrips.length > 0) {
        const filteredSpecialIncomes = specialTrips.filter(trip => trip.price * trip.passengers.length > 0)
        specialIncomes = filteredSpecialIncomes.map(trip => ({
            _id: trip._id,
            date: trip.date,
            name: trip.name,
            specialIncomes: trip.price * trip.passengers.length,
            incomes: 0
        }));
    }

    const filteredIncomes = trips.filter(trip => trip.price * trip.passengers.length > 0)

    const incomes = filteredIncomes.map(trip => ({
        _id: trip._id,
        date: trip.date,
        name: trip.name,
        incomes: trip.price * trip.passengers.length,
        specialIncomes: 0
    }));

    res.status(StatusCodes.OK).json([...incomes, ...specialIncomes]);
};

export const getYearlyIncomes = async (req, res) => {
    const { year } = req.params;

    const startDate = new Date(year, 0, 1); // January 1st of the given year
    const endDate = new Date(year, 11, 31); // December 31st of the given year

    const trips = await Trip.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    });

    const specialTrips = await SpecialTrip.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    });

    if (!trips || trips.length === 0) {
        throw new NotFoundError('No se han encontrado viajes para el año seleccionado');
    }

    // Create an object to store monthly incomes
    const monthlyIncomes = {};

    // Initialize monthly income data
    for (let i = 0; i < 12; i++) {
        const monthStartDate = new Date(year, i, 1);
        const monthEndDate = new Date(year, i + 1, 0);
        monthlyIncomes[i] = {
            month: i + 1, // Month number (1-based)
            totalIncomes: 0, // Initialize total income for the month
        };

        // Calculate total incomes for regular trips
        const filteredTrips = trips.filter(trip => trip.date >= monthStartDate && trip.date <= monthEndDate);
        for (const trip of filteredTrips) {
            monthlyIncomes[i].totalIncomes += trip.price * trip.passengers.length;
        }

        // Calculate total incomes for special trips
        const filteredSpecialTrips = specialTrips.filter(trip => trip.date >= monthStartDate && trip.date <= monthEndDate);
        for (const specialTrip of filteredSpecialTrips) {
            monthlyIncomes[i].totalIncomes += specialTrip.price * specialTrip.passengers.length;
        }
    }

    // Convert the object into an array of monthly incomes
    const monthlyIncomesArray = Object.values(monthlyIncomes);

    res.status(StatusCodes.OK).json(monthlyIncomesArray);
};