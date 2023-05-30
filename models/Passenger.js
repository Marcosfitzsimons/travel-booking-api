import mongoose from "mongoose";

const PassengerSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
})

export default mongoose.model('Passenger', PassengerSchema)