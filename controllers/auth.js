import bcrypt from "bcrypt";
import nodemailer from 'nodemailer'
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import sendConfirmationEmail from '../config/nodemailer.config.js';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const register = async (req, res, next) => {

    const { fullName, username, email, password, cpassword, addressCda, addressCapital, phone, dni } = req.body;
    if (!fullName || !email || !username || !password || !cpassword || !addressCda || !addressCapital || !phone || !dni) {
        throw new BadRequestError('Por favor, completar todos los datos antes de enviar.');
    }
    if (password !== cpassword) throw new BadRequestError('Contraseñas no coinciden.')
    if (password.length < 6 || cpassword.length < 6) throw new BadRequestError('Contraseña debe tener al menos 6 caracteres.')

    const emailLowercase = username.toLowerCase()

    const emailExists = await User.findOne({ emailLowercase });
    if (emailExists) {
        throw new BadRequestError('Email ya está en uso.');
    }

    const usernameLowercase = username.toLowerCase()

    const usernameExists = await User.findOne({ usernameLowercase });
    if (usernameExists) {
        throw new BadRequestError('Nombre de usuario ya está en uso.');
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const hashc = bcrypt.hashSync(cpassword, salt);

    const user = new User({
        ...req.body,
        username: usernameLowercase,
        email: emailLowercase,
        password: hash,
        cpassword: hashc
    });

    const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT, // Make sure this environment variable is set.
        { expiresIn: process.env.JWT_LIFETIME } // Make sure this environment variable is set.
    );

    user.confirmationCode = token; // Assign the generated token to the confirmationCode.

    await user.save();

    const { password: userPassword, cpassword: userCPassword, isAdmin, isPlus, ...otherDetails } = user._doc;

    res.status(StatusCodes.CREATED).json({
        details: { ...otherDetails },
        token: token
    });

    sendConfirmationEmail(
        user.fullName,
        user.emailLowercase,
        user.confirmationCode
    );
};

export const login = async (req, res, next) => {
    const { emailOrUsername, password: userReqPassword } = req.body

    if (!emailOrUsername) throw new BadRequestError('Ingresa tu nombre de usuario o email.')

    const emailOrUsernameLowercase = emailOrUsername.toLowerCase()

    let user = await User.findOne({ $or: [{ email: emailOrUsernameLowercase }, { username: emailOrUsernameLowercase }] });

    if (!user) throw new UnauthenticatedError('Usuario no encontrado.')

    if (user.status != "Active") throw new UnauthenticatedError('Cuenta pendiente. Por favor, verifique su email!')

    // bcrypt allow us to compare hash password with the password that is in the request.
    const isPasswordCorrect = await bcrypt.compare(userReqPassword, user.password)
    if (!isPasswordCorrect) throw new BadRequestError('Contraseña incorrecta.')

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT, { expiresIn: process.env.JWT_LIFETIME })

    const { password, cpassword, isAdmin, isPlus, ...otherDetails } = user._doc;

    res.status(StatusCodes.OK).json({
        details: { ...otherDetails },
        token: token,
        isAdmin
    })
}

// email config 

const user = process.env.ZOHO_USER
const pass = process.env.ZOHO_PASS

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false, // If true, port should be 465
    auth: {
        user: user,
        pass: pass,
        authMethod: 'PLAIN', // Specify PLAIN authentication method
    },
});

// send email link for reset password
export const sendPasswordLink = async (req, res) => {
    const { email } = req.body;
    if (!email) throw new UnauthenticatedError('Debes ingresar un email válido.')

    const emailLowercase = email.toLowerCase()
    const user = await User.findOne({ email: emailLowercase });
    if (!user) throw new UnauthenticatedError('No hay un usuario registrado con ese email.')

    // token generated for reset password
    const token = jwt.sign({ _id: user._id }, process.env.JWT, {
        expiresIn: "500s"
    });

    const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { verifyToken: token }, { new: true });


    if (setUserToken) {
        const mailOptions = {
            from: process.env.ZOHO_USER,
            to: emailLowercase,
            subject: "Recuperar contraseña", // change href value
            html: `Este link es válido por 5 minutos: <a href="https://www.fabebuscda.com.ar/forgotpassword/${user._id}/${setUserToken.verifyToken}">Recuperar contraseña</a>`
        }


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error", error);
                throw new UnauthenticatedError('Error al enviar email.')
            } else {
                console.log("Email sent", info.response);
                res.status(StatusCodes.OK).json({
                    message: "Email enviado con éxito"
                })
            }
        })

    }
}

// verify user for forgot password time
export const forgotPassword = async (req, res) => {
    const { id, token } = req.params;

    const validUser = await User.findOne({ _id: id, verifyToken: token });
    if (!validUser) throw new UnauthenticatedError('Usuario no existe.')

    const verifyToken = jwt.verify(token, process.env.JWT);

    if (validUser && verifyToken._id) {
        const { password, cpassword, isAdmin, isPlus, ...otherDetails } = validUser._doc;
        res.status(StatusCodes.OK).json({ ...otherDetails })
    } else {
        throw new UnauthenticatedError('Usuario no existe.')
    }

}

// change password
export const changePassword = async (req, res) => {
    const { id, token } = req.params;

    const { password } = req.body;

    const validUser = await User.findOne({ _id: id, verifyToken: token });

    const verifyToken = jwt.verify(token, process.env.JWT);

    if (validUser && verifyToken._id) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const setNewUserPass = await User.findByIdAndUpdate({ _id: id }, { password: hash });

        setNewUserPass.save();

        const { password: userPassword, cpassword, isAdmin, isPlus, ...otherDetails } = setNewUserPass._doc;

        res.status(StatusCodes.OK).json({ ...otherDetails })

    } else {
        throw new UnauthenticatedError('Usuario no existe.')
    }
}


// verify user status
export const verifyUser = async (req, res) => {
    let user = await User.findOne({
        confirmationCode: req.params.confirmationCode,
    })

    if (!user) throw new UnauthenticatedError('Usuario no encontrado.')

    user.status = "Active";
    await user.save()

    res.status(StatusCodes.OK).json({
        userStatus: user.status
    })
}
