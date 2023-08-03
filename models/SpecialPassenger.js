import mongoose from "mongoose";

// ADD TO SPECIAL PASSENGER SCHEMA
// isPaid: {
//     type: Boolean,
//     default: false,
// },

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