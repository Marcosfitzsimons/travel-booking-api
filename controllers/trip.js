import { format, parse, parseISO } from "date-fns";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js'
import Trip from "../models/Trip.js"
import User from "../models/User.js"

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
    if (req.user.isAdmin) {

        const tripPopulated = await updatedTrip.populate({
            path: 'passengers',
            populate: {
                path: 'createdBy',
                select: '_id username fullName addressCda addressCapital dni phone image email',
            },
            select: 'fullName dni addressCda addressCapital isPaid',
        })
        res.status(StatusCodes.OK).json(tripPopulated);

    } else {
        res.status(StatusCodes.OK).json(updatedTrip)
    }
}

export const deleteTrip = async (req, res) => {
    const trip = await Trip.findByIdAndDelete(req.params.id)
    if (!trip) throw new NotFoundError('Viaje no existe')

    res.status(StatusCodes.OK).json('Viaje ha sido eliminado.')

}

export const getTrip = async (req, res) => {
    const { userId, tripId } = req.params

    const user = await User.findById(userId)
    console.log(user)
    if (!user) throw new NotFoundError('Usuario no encontrado')

    const trip = await Trip.findById(tripId);
    if (!trip) throw new NotFoundError('Viaje no existe.')
    console.log(`trip found: ${trip._id}`)

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

    res.status(StatusCodes.OK).json(trips)

}

// Trip generation

// const generateAndSaveTrip = async (dayOfWeek, name, from, to, departureTime, arrivalTime, price, maxCapacity) => {
//     // Implement your trip generation logic here
//     // Adjust the logic to generate trips based on your requirements
//     const trip = {
//         name: name,
//         from: from,
//         to: to,
//         departureTime: departureTime,
//         arrivalTime: arrivalTime,
//         price: price,
//         maxCapacity: maxCapacity
//     };

//     const tripDate = getNextDayOfWeek(dayOfWeek)


//     const formattedTripDate = format(tripDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"); // Format tripDate to the desired format

//     const newTrip = new Trip({
//         ...trip,
//         date: formattedTripDate
//     })

//     const savedTrip = await newTrip.save();
//     return savedTrip;
// };

// const getNextDayOfWeek = (dayOfWeek) => {
//     const currentDate = new Date();
//     const currentDayOfWeek = currentDate.getUTCDay(); // Current day of the week (0 - Sunday, 1 - Monday, ..., 6 - Saturday)
//     let daysToAdd = dayOfWeek - currentDayOfWeek; // Calculate the number of days to add to reach the desired day of the week

//     if (daysToAdd <= 0) {
//         daysToAdd += 7; // If the desired day has already passed this week, move to the next occurrence
//     }

//     const nextDay = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
//     nextDay.setUTCHours(12, 0, 0, 0); // Set the time to the start of the day (midnight)

//     return nextDay;
// };

// (async () => {
//     const mondayTrips = [];
//     const wednesdayTrips = [];
//     const fridayTrips = [];
//     const sundayTrips = [];

//     mondayTrips.push(await generateAndSaveTrip(1, 'De Carmen a Capital Federal', 'Carmen de Areco', 'Capital Federal', '05:00', '07:30', 2500, 10));
//     mondayTrips.push(await generateAndSaveTrip(1, 'De Capital Federal a Carmen', 'Capital Federal', 'Carmen de Areco', '18:00', '20:30', 2500, 10));

//     wednesdayTrips.push(await generateAndSaveTrip(3, 'De Carmen a Capital Federal', 'Carmen de Areco', 'Capital Federal', '06:00', '08:30', 2500, 10));
//     wednesdayTrips.push(await generateAndSaveTrip(3, 'De Capital Federal a Carmen', 'Capital Federal', 'Carmen de Areco', '18:00', '20:30', 2500, 10));

//     fridayTrips.push(await generateAndSaveTrip(5, 'De Carmen a Capital Federal', 'Carmen de Areco', 'Capital Federal', '07:00', '09:30', 2500, 10));
//     fridayTrips.push(await generateAndSaveTrip(5, 'De Capital Federal a Carmen', 'Capital Federal', 'Carmen de Areco', '18:00', '20:30', 2500, 10));

//     sundayTrips.push(await generateAndSaveTrip(0, 'De Carmen a Capital Federal', 'Carmen de Areco', 'Capital Federal', '19:30', '22:00', 2500, 10));
//     sundayTrips.push(await generateAndSaveTrip(0, 'De Capital Federal a Carmen', 'Capital Federal', 'Carmen de Areco', '23:30', '01:30', 2500, 10));

//     console.log('Monday trips:', mondayTrips);
//     console.log('Wednesday trips:', wednesdayTrips);
//     console.log('Friday trips:', fridayTrips);
//     console.log('Sunday trips:', sundayTrips);
// })();