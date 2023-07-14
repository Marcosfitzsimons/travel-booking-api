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
        },
        streetNumber: {
            type: Number,
        },
        crossStreets: {
            type: String,
        }
    },
    addressCapital: {
        type: String,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
})

export default mongoose.model('Passenger', PassengerSchema)