import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Por favor, ingresar nombre de usuario.'],
        minLength: 3,
        maxLength: 15,
        trim: true,
        unique: true,
    },
    fullName: {
        type: String,
        minLength: 3,
        maxLength: 35,
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
        minLength: 6,
        maxLength: 100,
        trim: true,
    },
    cpassword: {
        type: String,
        required: [true, 'Por favor, confirma tu contraseña.'],
        minLength: 6,
        maxLength: 100,
        trim: true,
    },
    phone: {
        type: Number,
        required: [true, 'Por favor, ingresar número celular.'],
        minLength: 6,
        maxLength: 20,
    },
    dni: {
        type: Number,
        required: [true, 'Por favor, ingresar DNI.'],
        minLength: 6,
        maxLength: 20,
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
            required: [true, 'Por favor, ingresar las calles que cruzan.'],
            minLength: [3, 'Las calles que cruzan deben tener al menos 3 caracteres.'],
            maxLength: [50, 'Las calles que cruzan no deben exceder los 50 caracteres.'],
        }
    },
    addressCapital: {
        type: String,
        required: [true, 'Por favor, ingresar dirreción (Capital).'],
        minLength: [3, 'La dirección debe tener al menos 3 caracteres.'],
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
    myTrips: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    }],
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    confirmationCode: {
        type: String,
        unique: true
    },
    verifyToken: {
        type: String
    }
},
    { timestamps: true }
);

export default mongoose.model('User', UserSchema)