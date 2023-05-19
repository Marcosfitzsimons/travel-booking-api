import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Por favor, ingresar username.'],
        minLength: 3,
        maxLength: 15,
        trim: true,
        unique: true,
    },
    fullName: {
        type: String,
        minLength: 3,
        maxLength: 25,
        required: [true, 'Por favor, ingresar nombre completo.']
    },
    email: {
        type: String,
        required: [true, 'Por favor, ingresar email.'],
        minLength: 3,
        maxLength: 40,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Por favor, escribí un email válido.'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Por favor, ingresar contraseña.'],
        minLength: 3,
        trim: true,
    },
    addressCda: {
        type: String,
        required: [true, 'Por favor, ingresar dirreción (Carmen de Areco).'],
        minLength: 3,
        maxLength: 40,
    },
    phone: {
        type: Number,
        required: [true, 'Por favor, ingresar número celular.'],
    },
    dni: {
        type: Number,
        required: [true, 'Por favor, ingresar DNI.'],
    },
    addressCapital: {
        type: String,
        required: [true, 'Por favor, ingresar dirreción (Capital).'],
        minLength: 3,
        maxLength: 40,
    },
    image: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isPlus: {
        type: Boolean,
        default: false,
    },
    isReminder: {
        type: Boolean,
        default: false,
    },
    myTrips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    }],
},
    { timestamps: true }
);

export default mongoose.model('User', UserSchema)