import mongoose from "mongoose";

const SpecialTripSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ingresa nombre del viaje.']
    },
    date: {
        type: Date,
        required: [true, 'Ingresa fecha del viaje.']
    },
    from: {
        type: String,
        required: [true, 'Ingresa ubicación de partida del viaje.']
    },
    to: {
        type: String,
        required: [true, 'Ingresa ubicación de llegada del viaje.']
    },
    departureTime: {
        type: String,
        required: [true, 'Ingresa horario de salida del viaje.']
    },
    price: {
        type: Number,
        required: [true, 'Ingresa precio del viaje.']
    },
    maxCapacity: {
        type: Number,
        required: [true, 'Ingresa capacidad maxima del viaje.']
    },
    available: {
        type: Boolean,
        default: true,
    },
    passengers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SpecialPassenger'
    }]

})

export default mongoose.model('SpecialTrip', SpecialTripSchema)