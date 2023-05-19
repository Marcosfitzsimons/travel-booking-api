import mongoose from "mongoose";

const PublicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Ingresa el titulo de tu publicación']
    },
    subtitle: {
        type: String,
    },
    description: {
        type: String,
        required: [true, 'Ingresa la descripción de tu publicación']
    },
    image: {
        type: String,
    },
}, { timestamps: true })

export default mongoose.model('Trip', PublicationSchema)