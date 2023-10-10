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
        throw new BadRequestError('Por favor, completar todos los datos antes de enviar');
    }
    if (password !== cpassword) throw new BadRequestError('Contraseñas no coinciden')
    if (password.length < 6 || cpassword.length < 6) throw new BadRequestError('Contraseña debe tener al menos 6 caracteres')

    const emailLowercase = email.toLowerCase()
    const usernameLowercase = username.toLowerCase()

    const emailExists = await User.findOne({ emailLowercase });
    if (emailExists) {
        throw new BadRequestError('Email ya está en uso');
    }

    const usernameExists = await User.findOne({ usernameLowercase });
    if (usernameExists) {
        throw new BadRequestError('Nombre de usuario ya está en uso');
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = new User({
        fullName,
        username: usernameLowercase,
        email: emailLowercase,
        password: hash,
        addressCda,
        addressCapital,
        phone,
        dni
    });

    const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT,
        { expiresIn: process.env.JWT_LIFETIME }
    );

    user.confirmationCode = token;

    await user.save();

    res.status(StatusCodes.CREATED).json({
        "success": "Usuario creado con éxito"
    });

    sendConfirmationEmail(
        user.fullName,
        user.email,
        user.confirmationCode
    );
};

export const login = async (req, res, next) => {
    const { emailOrUsername, password: userReqPassword } = req.body

    if (!emailOrUsername) throw new BadRequestError('Ingresa tu nombre de usuario o email')

    const emailOrUsernameLowercase = emailOrUsername.toLowerCase()

    let user = await User.findOne({ $or: [{ email: emailOrUsernameLowercase }, { username: emailOrUsernameLowercase }] });

    if (!user) throw new UnauthenticatedError('Usuario no existe')

    if (user.status != "Active") throw new UnauthenticatedError('Cuenta pendiente. Por favor, verifique su email!')

    // bcrypt allow us to compare hash password with the password that is in the request.
    const isPasswordCorrect = await bcrypt.compare(userReqPassword, user.password)
    if (!isPasswordCorrect) throw new BadRequestError('Contraseña incorrecta')


    const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT,
        { expiresIn: process.env.JWT_LIFETIME } // production: ~ 1h
    )

    const refreshToken = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.REFRESH_JWT,
        { expiresIn: process.env.REFRESH_JWT_LIFETIME }
    )

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 20 * 24 * 60 * 60 * 1000 }); // secure: true, sameSite: 'None'

    const { _id, status, isAdmin, image } = user._doc;

    if (user.isAdmin) {
        res.status(StatusCodes.OK).json({
            details: { _id, isAdmin, image },
            token: token
        })
    } else {
        res.status(StatusCodes.OK).json({
            details: { _id, status, image },
            token: token
        })
    }
}

export const logout = async (req, res, next) => {
    // Delete the accessToken on client

    const cookies = req.cookies

    if (!cookies?.jwt) throw new UnauthenticatedError('Problem with cookies')

    const refreshTokenValue = cookies.jwt;

    let user = await User.findOne({ refreshToken: refreshTokenValue });
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' }); // Add secure: true
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    // Delete refreshToken in db
    user.refreshToken = ""; // Clear the refreshToken field
    await user.save();

    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' }); // Add secure: true
    return res.status(StatusCodes.NO_CONTENT).send();
}

export const refreshToken = async (req, res, next) => {
    const cookies = req.cookies

    if (!cookies?.jwt) throw new UnauthenticatedError('Problem with cookies')

    const refreshTokenValue = cookies.jwt;

    let user = await User.findOne({ refreshToken: refreshTokenValue });
    if (!user) throw new UnauthenticatedError('Usuario no encontrado')


    jwt.verify(
        refreshTokenValue,
        process.env.REFRESH_JWT,
        (err, decoded) => {
            if (err || user._id.toString() !== decoded.id) return res.sendStatus(403);

            const accessToken = jwt.sign(
                { id: decoded.id, isAdmin: decoded.isAdmin },
                process.env.JWT,
                { expiresIn: process.env.JWT_LIFETIME }
            )

            if (user.isAdmin) {
                res.status(StatusCodes.OK).json({
                    user: {
                        _id: used._id,
                        isAdmin: user.isAdmin,
                        image: user.image
                    },
                    token: accessToken
                })
            } else {
                res.status(StatusCodes.OK).json({
                    user: {
                        _id: user._id,
                        status: user.status,
                        image: user.image
                    },
                    token: accessToken
                })
            }

        }
    )
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
    if (!email) throw new UnauthenticatedError('Debes ingresar un email válido')

    const emailLowercase = email.toLowerCase()
    const user = await User.findOne({ email: emailLowercase });
    if (!user) throw new UnauthenticatedError('No hay un usuario registrado con ese email')

    // token generated for reset password
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT, {
        expiresIn: "800s"
    });

    const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { verifyToken: token }, { new: true });

    if (setUserToken) {
        const sanitizedToken = token.replace(/\./g, '_');

        const mailOptions = {
            from: process.env.ZOHO_USER,
            to: emailLowercase,
            subject: "Recuperar contraseña",
            html: `Este link es válido por 5 minutos: <a href="https://www.fabebuscda.com.ar/forgotpassword/${user._id}/${sanitizedToken}">Recuperar contraseña</a>`
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

// verify user for forgot password
export const forgotPassword = async (req, res) => {
    const { id, token } = req.params;

    const verifyToken = jwt.verify(token, process.env.JWT);

    const validUser = await User.findOne({ _id: id });
    if (!validUser) throw new UnauthenticatedError('Usuario no existe')

    if (verifyToken.id) {
        res.status(StatusCodes.NO_CONTENT).send()
    } else {
        throw new UnauthenticatedError('Usuario no existe')
    }

}

// change password
export const changePassword = async (req, res) => {
    const { id } = req.params;

    const { password, cpassword, token } = req.body;

    if (!password || !cpassword) throw new BadRequestError('Debes completar los campos antes de enviar')
    if (password !== cpassword) throw new BadRequestError('Contraseñas no coinciden')
    if (password.length < 6 || cpassword.length < 6) throw new BadRequestError('Contraseña debe tener al menos 6 caracteres')

    if (!token) throw new BadRequestError('Token es requerido')

    const validUser = await User.findOne({ _id: id });
    if (!validUser) throw new UnauthenticatedError('Usuario no existe')

    const verifyToken = jwt.verify(token, process.env.JWT);

    if (verifyToken.id) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const setNewUserPass = await User.findByIdAndUpdate({ _id: id }, { password: hash });

        setNewUserPass.save();

        res.status(StatusCodes.NO_CONTENT).send()
    } else {
        throw new UnauthenticatedError('Usuario no existe')
    }
}

// verify user
export const verifyUser = async (req, res) => {
    let user = await User.findOne({
        confirmationCode: req.params.confirmationCode,
    })

    if (!user) throw new UnauthenticatedError('Usuario no existe')

    user.status = "Active";
    await user.save()

    res.status(StatusCodes.OK).json({
        userStatus: user.status
    })
}
