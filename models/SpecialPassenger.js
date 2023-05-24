import mongoose from "mongoose";

const SpecialPassengerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        minLength: 3,
        maxLength: 25,
    },
    dni: {
        type: Number,
    },
}, {
    timestamps: true,
})

export default mongoose.model('SpecialPassenger', SpecialPassengerSchema)