import mongoose from "mongoose";

const PassengerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        minLength: 3,
        maxLength: 25,
    },
    dni: {
        type: Number,
    },
    addressCda: {
        street: {
            type: String,
            required: [true, 'Por favor, ingresar calle.'],
            minLength: [3, 'La calle debe tener al menos 3 caracteres.'],
            maxLength: [40, 'La calle no debe exceder los 40 caracteres.'],
        },
        streetNumber: {
            type: Number,
            required: [true, 'Por favor, ingresar número de calle.'],
            min: [1, 'El número de calle debe ser mayor o igual a 1.'],
            max: [100000, 'El número de calle debe ser menor a 100000.'],
        },
        crossStreets: {
            type: String,
            minLength: [3, 'Las calles que cruzan deben tener al menos 3 caracteres.'],
            maxLength: [50, 'Las calles que cruzan no deben exceder los 50 caracteres.'],
        }
    },
    addressCapital: {
        type: String,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
})

export default mongoose.model('Passenger', PassengerSchema)