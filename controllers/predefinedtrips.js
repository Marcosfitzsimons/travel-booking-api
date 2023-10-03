import PredefinedTrip from "../models/PredefinedTrip.js"
import { StatusCodes } from 'http-status-codes';
import { format, addDays } from "date-fns";
import { BadRequestError, NotFoundError } from '../errors/index.js'
import Trip from "../models/Trip.js";
import cron from 'node-cron'

// Get all predefined trips
export const getAllPredefinedTrips = async (req, res) => {
    const predefinedTrips = await PredefinedTrip.find();
    if (!predefinedTrips || predefinedTrips.length === 0) throw new NotFoundError('No se han encontrado viajes fijos')

    res.status(StatusCodes.OK).json(predefinedTrips);

};

// Get predefined trips for a specific day of the week
export const getPredefinedTripsForDay = async (req, res) => {
    const { dayOfWeek } = req.params;

    const predefinedTripsForDay = await PredefinedTrip.findOne({ dayOfWeek });

    if (!predefinedTripsForDay) throw new NotFoundError('No se han encontrado viajes fijos para el día seleccionado')

    res.status(StatusCodes.OK).json(predefinedTripsForDay);

};

// Create a new predefined trip for a specific day of the week
export const createPredefinedTrip = async (req, res) => {
    const { dayOfWeek, tripData } = req.body;

    if (!dayOfWeek) throw new BadRequestError('Debes ingresar el día de la semana')
    if (!tripData) throw new BadRequestError('Debes ingresar información acerca del viaje')

    const predefinedTripsForDay = await PredefinedTrip.findOneAndUpdate(
        { dayOfWeek },
        {
            $push: { trips: tripData }
        },
        { new: true, upsert: true }
    );

    if (!predefinedTripsForDay) throw new NotFoundError('Ha ocurrido un error al crear viaje fijo')

    res.status(StatusCodes.OK).json(predefinedTripsForDay);

};

// Update predefined trips for a specific day of the week
// unused
export const updatePredefinedTripsForDay = async (req, res) => {
    const { dayOfWeek } = req.params;
    const { trips } = req.body;

    if (!trips) throw new BadRequestError('Debes ingresar los viajes para ese día')

    // trips must be the new updated trips array...
    // like: [{tripUpdated}, {prevTrip}, {newTrip?}]

    const updatedPredefinedTripsForDay = await PredefinedTrip.findOneAndUpdate(
        { dayOfWeek },
        { trips },
        { new: true }
    );

    if (!updatedPredefinedTripsForDay) throw new NotFoundError('Ha ocurrido un error al actualizar viajes fijos')

    res.status(StatusCodes.OK).json(updatedPredefinedTripsForDay);

};

// Delete predefined trips for a specific day of the week
export const deletePredefinedTripsForDay = async (req, res) => {
    const { dayOfWeek } = req.params;

    const deletedTrip = await PredefinedTrip.findOneAndRemove({ dayOfWeek });
    if (!deletedTrip) throw new NotFoundError('No hay viajes fijos para el día seleccionado')

    res.status(StatusCodes.OK).json(`Viajes fijos eliminados con éxito`)
};

export const addTripToPredefinedDay = async (req, res) => {
    const { dayOfWeek } = req.params;
    const { tripData } = req.body;

    if (!tripData) throw new BadRequestError('Debes ingresar información acerca del viaje');

    const predefinedTripsForDay = await PredefinedTrip.findOne({ dayOfWeek });

    if (!predefinedTripsForDay) {
        throw new NotFoundError('No se encontraron viajes predefinidos para el día especificado');
    }

    // Check if the trips array already has 4 or more trips
    if (predefinedTripsForDay.trips.length >= 4) throw new BadRequestError("No puedes agregar más de 4 viajes predefinidos por día");

    // If the check passes, push the new trip data
    predefinedTripsForDay.trips.push(tripData);

    const updatedPredefinedTripsForDay = await predefinedTripsForDay.save();

    res.status(StatusCodes.OK).json(updatedPredefinedTripsForDay);
};

export const updateTripInPredefinedDay = async (req, res) => {
    const { dayOfWeek, tripId } = req.params;
    const { updatedTripData } = req.body;

    if (!updatedTripData) throw new BadRequestError('Debes ingresar información acerca del viaje');

    // Update the specific trip with the new data using the $ positional operator
    const updatedPredefinedTripsForDay = await PredefinedTrip.findOneAndUpdate(
        { dayOfWeek, "trips._id": tripId },
        { $set: { "trips.$": updatedTripData } },
        { new: true }
    );

    if (!updatedPredefinedTripsForDay) throw new NotFoundError('Ha ocurrido un error al actualizar viaje fijo');

    res.status(StatusCodes.OK).json(updatedPredefinedTripsForDay);
};

export const deleteTripFromPredefinedDay = async (req, res) => {
    const { dayOfWeek, tripId } = req.params;

    const updatedPredefinedTripsForDay = await PredefinedTrip.findOneAndUpdate(
        { dayOfWeek },
        { $pull: { trips: { _id: tripId } } }, // Remove the trip at the specified index
        { new: true }
    );
    if (!updatedPredefinedTripsForDay) throw new NotFoundError('Ha ocurrido un error al eliminar viaje fijo');

    res.status(StatusCodes.OK).json(updatedPredefinedTripsForDay);

};

const generateAndSaveTrips = async () => {
    try {
        // Fetch predefined trips from the database
        const predefinedTrips = await PredefinedTrip.find();

        // Calculate the current day of the week (0 - Sunday, 1 - Monday, ..., 6 - Saturday)
        const currentDayOfWeek = new Date().getUTCDay();

        // Calculate the date of the next two weeks
        const currentDate = new Date();
        const twoWeeksLater = addDays(currentDate, 14);

        // Iterate through predefined trips and generate trips
        for (const predefinedTrip of predefinedTrips) {
            // Determine the desired day of the week for this predefined trip
            const desiredDayOfWeek = predefinedTrip.dayOfWeek === 'sunday' ? 0 :
                predefinedTrip.dayOfWeek === 'monday' ? 1 :
                    predefinedTrip.dayOfWeek === 'tuesday' ? 2 :
                        predefinedTrip.dayOfWeek === 'wednesday' ? 3 :
                            predefinedTrip.dayOfWeek === 'thursday' ? 4 :
                                predefinedTrip.dayOfWeek === 'friday' ? 5 :
                                    predefinedTrip.dayOfWeek === 'saturday' ? 6 : -1;

            // Calculate the date of the desired day of the week for the next two weeks
            let tripDate = new Date(currentDate.getTime());
            tripDate.setDate(currentDate.getDate() + (desiredDayOfWeek + 7 - currentDayOfWeek) % 7);

            // Generate and save trips for the next two weeks
            while (tripDate <= twoWeeksLater) {
                for (const tripDetails of predefinedTrip.trips) {
                    // Check if a trip already exists for this date, departure time, and predefined trip
                    const formattedTripDate = format(tripDate, "yyyy-MM-dd'T'12:00:00.000xxx"); // Format tripDate with the fixed time
                    const existingTrip = await Trip.findOne({
                        date: formattedTripDate,
                        departureTime: tripDetails.departureTime,
                        name: tripDetails.name, // Add this condition to check the trip name
                    });

                    // If no trip exists, create and save a new trip
                    if (!existingTrip) {
                        const newTrip = new Trip({
                            name: tripDetails.name,
                            from: tripDetails.from,
                            to: tripDetails.to,
                            departureTime: tripDetails.departureTime,
                            arrivalTime: tripDetails.arrivalTime,
                            price: tripDetails.price,
                            maxCapacity: tripDetails.maxCapacity,
                            date: format(tripDate, "yyyy-MM-dd'T'12:00:00.000xxx"),
                        });

                        // Save the trip to the database
                        await newTrip.save();
                    }
                }

                // Move to the same day of the next week
                tripDate.setDate(tripDate.getDate() + 7);
            }
        }

        console.log('Trips generated successfully.');
    } catch (error) {
        console.error('Error generating trips:', error);
    }
};

cron.schedule('0 7 * * *', () => {
    generateAndSaveTrips();
});
