import bcrypt from "bcrypt";
import nodemailer from 'nodemailer'
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import sendConfirmationEmail from '../config/nodemailer.config.js';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const register = async (req, res, next) => {
    const { fullName, username, email, password, addressCda, addressCapital, phone, dni } = req.body;
    if (!fullName || !email || !username || !password || !addressCda || !addressCapital || !phone || !dni) {
        throw new BadRequestError('Por favor, completar todos los datos antes de enviar.');
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
        throw new BadRequestError('Email ya está en uso.');
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        throw new BadRequestError('Nombre de usuario ya está en uso.');
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = new User({
        ...req.body,
        password: hash,
    });

    const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT, // Make sure this environment variable is set.
        { expiresIn: process.env.JWT_LIFETIME } // Make sure this environment variable is set.
    );

    user.confirmationCode = token; // Assign the generated token to the confirmationCode.

    await user.save();

    const { password: userPassword, isAdmin, isPlus, ...otherDetails } = user._doc;

    res.status(StatusCodes.CREATED).json({
        details: { ...otherDetails },
        token: token
    });

    sendConfirmationEmail(
        user.fullName,
        user.email,
        user.confirmationCode
    );
};

export const login = async (req, res, next) => {
    const { emailOrUsername, password: userReqPassword } = req.body

    let user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

    if (!emailOrUsername) throw new BadRequestError('Ingresa tu nombre de usuario o email.')
    if (!user) throw new UnauthenticatedError('Usuario no encontrado.')

    if (user.status != "Active") throw new UnauthenticatedError('Cuenta pendiente. Por favor, verifique su email!')

    // bcrypt allow us to compare hash password with the password that is in the request.
    const isPasswordCorrect = await bcrypt.compare(userReqPassword, user.password)
    if (!isPasswordCorrect) throw new BadRequestError('Contraseña incorrecta.')

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT, { expiresIn: process.env.JWT_LIFETIME })

    const { password, isAdmin, isPlus, ...otherDetails } = user._doc

    res.status(StatusCodes.OK).json({
        details: { ...otherDetails },
        token: token,
        isAdmin
    })
}

// check if works

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
    if (!email) throw new UnauthenticatedError('Email no registrado.')

    const user = await User.findOne({ email: email });
    if (!user) throw new UnauthenticatedError('Usuario no registrado.')

    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, process.env.JWT, {
        expiresIn: "500s"
    });

    const setUserToken = await user.findByIdAndUpdate({ _id: user._id }, { verifyToken: token }, { new: true });


    if (setUserToken) {
        const mailOptions = {
            from: process.env.ZOHO_USER,
            to: email,
            subject: "Recuperar contraseña", // change href value
            text: `Este link es válido por 5 minutos: <a href=http://localhost:3001/forgotpassword/${user._id}/${setUserToken.verifyToken}>Recuperar Contraseña</a>`
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

// check if works
// verify user for forgot password time
export const forgotPassword = async (req, res) => {
    const { id, token } = req.params;

    const validUser = await User.findOne({ _id: id, verifyToken: token });

    const verifyToken = jwt.verify(token, process.env.JWT);

    if (validUser && verifyToken.id) {
        res.status(StatusCodes.OK).json(validUser)
    } else {
        throw new UnauthenticatedError('Usuario no existe.')
    }

}

// check if works
// change password
export const changePassword = async (req, res) => {
    const { id, token } = req.params;

    const { password } = req.body;

    const validUser = await User.findOne({ _id: id, verifyToken: token });

    const verifyToken = jwt.verify(token, process.env.JWT);

    if (validUser && verifyToken.id) {
        const newPassword = await bcrypt.hash(password, 12);

        const setNewUserPass = await User.findByIdAndUpdate({ _id: id }, { password: newPassword });

        setNewUserPass.save();
        res.status(StatusCodes.OK).json(setNewUserPass)

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
