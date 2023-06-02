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
        type: String,
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