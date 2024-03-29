import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ingresa nombre del viaje.'],
        minLength: [3, 'El nombre del viaje debe tener al menos 3 caracteres.'],
        maxLength: [60, 'El nombre del viaje no puede tener más de 60 caracteres.']
    },
    date: {
        type: Date,
        required: [true, 'Ingresa fecha del viaje.']
    },
    from: {
        type: String,
        required: [true, 'Ingresa ubicación de partida del viaje.'],
        minLength: [3, 'Ubicación de partida debe tener al menos 3 caracteres.'],
        maxLength: [60, 'Ubicación de partida no puede tener más de 60 caracteres.']
    },
    to: {
        type: String,
        required: [true, 'Ingresa ubicación de llegada del viaje.'],
        minLength: [3, 'Ubicación de llegada debe tener al menos 3 caracteres.'],
        maxLength: [60, 'Ubicación de llegada no puede tener más de 60 caracteres.']
    },
    departureTime: {
        type: String,
        required: [true, 'Ingresa horario de salida del viaje.']
    },
    arrivalTime: {
        type: String,
        required: [true, 'Ingresa horario de llegada del viaje.']
    },
    price: {
        type: Number,
        required: [true, 'Ingresa precio del viaje.'],
        min: [1, 'El precio mínimo debe ser al menos 1.'],
        max: [30000, 'El precio máximo no puede ser mayor a 30000.']
    },
    maxCapacity: {
        type: Number,
        required: [true, 'Ingresa capacidad máxima del viaje.'],
        min: [1, 'La capacidad mínima debe ser al menos 1.'],
        max: [30, 'La capacidad máxima no puede ser mayor a 30.']
    },
    available: {
        type: Boolean,
        default: true,
    },
    passengers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger'
    }]

})

export default mongoose.model('Trip', TripSchema)