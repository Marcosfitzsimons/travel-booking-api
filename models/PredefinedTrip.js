import mongoose from "mongoose";

const PredefinedTripSchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        required: true,
        unique: true,
    },
    trips: [
        {
            name: String,
            from: String,
            to: String,
            departureTime: String,
            arrivalTime: String,
            price: Number,
            maxCapacity: Number,
        },
    ],
});

export default mongoose.model('PredefinedTrip', PredefinedTripSchema)