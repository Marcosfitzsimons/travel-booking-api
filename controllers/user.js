import { StatusCodes } from 'http-status-codes';
import { format, parse } from "date-fns";
import { BadRequestError, NotFoundError } from '../errors/index.js'
import User from "../models/User.js"
import bcrypt from "bcrypt";

export const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new NotFoundError('Usuario no encontrado')

    const { addressCapital, ...userDetails } = req.body.userData;

    if (!req.body.userData) throw new NotFoundError('Error al encontrar información acerca del usuario')

    if (!addressCapital) throw new BadRequestError('Por favor, completar todos los datos antes de enviar');

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { addressCapital, ...userDetails } }, { new: true }).populate('myTrips')
    if (!updatedUser) throw new NotFoundError('Error al editar usuario')

    const currentDate = parse(format(new Date(), "dd/MM/yy"), "dd/MM/yy", new Date());
    if (req.user.isAdmin) {
        const userTrips = user.myTrips.map(trip => ({
            id: trip._id,
            name: trip.name,
            date: trip.date,
            from: trip.from,
            to: trip.to,
            departureTime: trip.departureTime,
            arrivalTime: trip.arrivalTime,
            price: trip.price,
            maxCapacity: trip.maxCapacity,
            available: trip.available
        }))
        const filteredUserTrips = userTrips.filter(trip => trip.date >= currentDate).sort((a, b) => new Date(a.date) - new Date(b.date))

        res.status(StatusCodes.OK).json({
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                addressCda: updatedUser.addressCda,
                addressCapital: updatedUser.addressCapital,
                phone: updatedUser.phone,
                dni: updatedUser.dni,
                myTrips: filteredUserTrips,
                image: updatedUser.image,
            }
        })
    } else {
        res.status(StatusCodes.OK).json({
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                addressCda: updatedUser.addressCda,
                addressCapital: updatedUser.addressCapital,
                phone: updatedUser.phone,
                dni: updatedUser.dni,
                image: updatedUser.image,
            }
        })
    }
}

export const updateUserStatus = async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new NotFoundError('Usuario no encontrado')

    const { status } = req.body.userData;
    if (!status) throw new BadRequestError('Por favor, proporciona un estado válido.');

    user.status = status;
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Estado del usuario actualizado exitosamente.', userStatus: user.status });
}

export const updateUserAddresses = async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new NotFoundError('Usuario no encontrado')

    const { addressCapital, addressCda } = req.body;
    if (!addressCda || !addressCapital) {
        throw new BadRequestError('Por favor, completar todos los datos antes de enviar.');
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { addressCapital, addressCda } }, { new: true })
    if (!updatedUser) throw new NotFoundError('Error al editar domicilios.')

    const updatedAddresses = {
        addressCapital: updatedUser.addressCapital,
        addressCda: updatedUser.addressCda
    };

    res.status(StatusCodes.OK).json(updatedAddresses)
}

export const updateAdminProfile = async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new NotFoundError('Usuario no encontrado')

    const userData = req.body.userData;
    if (!userData) throw new NotFoundError('Error al encontrar información')

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { ...userData } }, { new: true })
    if (!updatedUser) throw new NotFoundError('Error al editar usuario')

    res.status(StatusCodes.OK).json({
        user: {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            image: updatedUser.image,
        }
    })

}

export const handleChangePassword = async (req, res) => {
    const { id } = req.params;

    const { password, cpassword } = req.body;

    if (!password || !cpassword) throw new BadRequestError('Debes completar los datos antes de enviar')
    if (password !== cpassword) throw new BadRequestError('Contraseñas no coinciden')
    if (password.length < 6 || cpassword.length < 6) throw new BadRequestError('Contraseña debe tener al menos 6 caracteres')

    const validUser = await User.findOne({ _id: id });
    if (!validUser) throw new UnauthenticatedError('Usuario no existe.')


    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const hashc = bcrypt.hashSync(cpassword, salt);

    const setNewUserPass = await User.findByIdAndUpdate({ _id: id }, { $set: { password: hash, cpassword: hashc } }, { new: true });

    setNewUserPass.save();

    res.status(StatusCodes.NO_CONTENT).send()
}

export const deleteUser = async (req, res) => {

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) throw new NotFoundError('Usuario no existe.')
    res.status(StatusCodes.OK).json('Usuario eliminado con éxito.')

}

export const getUser = async (req, res) => {

    const user = await User.findById(req.params.id).populate('myTrips');
    if (!user) throw new NotFoundError('Usuario no existe.')

    const currentDate = parse(format(new Date(), "dd/MM/yy"), "dd/MM/yy", new Date());
    if (req.user.isAdmin) {
        const userTrips = user.myTrips.map(trip => ({
            id: trip._id,
            name: trip.name,
            date: trip.date,
            from: trip.from,
            to: trip.to,
            departureTime: trip.departureTime,
            arrivalTime: trip.arrivalTime,
            price: trip.price,
            maxCapacity: trip.maxCapacity,
            available: trip.available
        }))
        const filteredUserTrips = userTrips.filter(trip => trip.date >= currentDate).sort((a, b) => new Date(a.date) - new Date(b.date))
        res.status(StatusCodes.OK).json({
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                addressCda: user.addressCda,
                addressCapital: user.addressCapital,
                phone: user.phone,
                dni: user.dni,
                myTrips: filteredUserTrips,
                image: user.image,
                status: user.status
            }
        })
    } else {
        res.status(StatusCodes.OK).json({
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                addressCda: user.addressCda,
                addressCapital: user.addressCapital,
                phone: user.phone,
                dni: user.dni,
                image: user.image,
            }
        })
    }

}

export const getUserAddresses = async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new NotFoundError('Usuario no existe.')

    res.status(StatusCodes.OK).json({
        userAddresses: {
            addressCda: user.addressCda,
            addressCapital: user.addressCapital,
        }
    })
}

export const getUserTrips = async (req, res) => {
    const user = await User.findById(req.params.id).populate('myTrips');
    if (!user) throw new NotFoundError('Usuario no existe.')

    const currentDate = parse(format(new Date(), "dd/MM/yy"), "dd/MM/yy", new Date());
    const userTrips = user.myTrips.map(trip => ({
        _id: trip._id,
        name: trip.name,
        date: trip.date,
        from: trip.from,
        to: trip.to,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        price: trip.price,
        maxCapacity: trip.maxCapacity,
        available: trip.available
    }))

    const filteredUserTrips = userTrips.filter(trip => trip.date >= currentDate).sort((a, b) => new Date(a.date) - new Date(b.date))
    res.status(StatusCodes.OK).json({
        userTrips: filteredUserTrips
    })
}

export const getUsers = async (req, res) => {
    const users = await User.find()

    const filteredUsers = users
        .filter(user => !user.isAdmin)
        .map(user => ({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            dni: user.dni,
            status: user.status,
            image: user.image,
            addressCda: user.addressCda,
            addressCapital: user.addressCapital,
        }));

    res.status(StatusCodes.OK).json(filteredUsers)
}

