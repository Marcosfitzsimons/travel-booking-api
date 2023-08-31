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

    const emailLowercase = email.toLowerCase()
    const usernameLowercase = username.toLowerCase()

    const emailExists = await User.findOne({ emailLowercase });
    if (emailExists) {
        throw new BadRequestError('Email ya está en uso.');
    }


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

    if (!emailOrUsername) throw new BadRequestError('Ingresa tu nombre de usuario o email.')

    const emailOrUsernameLowercase = emailOrUsername.toLowerCase()

    let user = await User.findOne({ $or: [{ email: emailOrUsernameLowercase }, { username: emailOrUsernameLowercase }] });

    if (!user) throw new UnauthenticatedError('Usuario no encontrado.')

    if (user.status != "Active") throw new UnauthenticatedError('Cuenta pendiente. Por favor, verifique su email!')

    // bcrypt allow us to compare hash password with the password that is in the request.
    const isPasswordCorrect = await bcrypt.compare(userReqPassword, user.password)
    if (!isPasswordCorrect) throw new BadRequestError('Contraseña incorrecta.')


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

    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 20 * 24 * 60 * 60 * 1000 }); // secure: true, sameSite: 'None', secure: true

    const { _id, status, image } = user._doc;

    res.status(StatusCodes.OK).json({
        details: { _id, status, image },
        token: token
    })
}

export const logout = async (req, res, next) => {
    // Delete the accessToken on client

    const cookies = req.cookies

    if (!cookies?.jwt) throw new UnauthenticatedError('Problem with cookies')

    const refreshTokenValue = cookies.jwt;

    let user = await User.findOne({ refreshToken: refreshTokenValue });
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // Add secure: true
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    // Delete refreshToken in db
    user.refreshToken = ""; // Clear the refreshToken field
    await user.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); // Add secure: true
    return res.status(StatusCodes.NO_CONTENT).send();
}

export const refreshToken = async (req, res, next) => {
    const cookies = req.cookies

    if (!cookies?.jwt) throw new UnauthenticatedError('Problem with cookies')

    const refreshTokenValue = cookies.jwt;

    let user = await User.findOne({ refreshToken: refreshTokenValue });
    if (!user) throw new UnauthenticatedError('Usuario no encontrado.')
    console.log(refreshTokenValue)
    console.log(user._id)

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
            res.status(StatusCodes.OK).json({
                isAdmin: decoded.isAdmin,
                token: accessToken
            })
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
    if (!email) throw new UnauthenticatedError('Debes ingresar un email válido.')

    const emailLowercase = email.toLowerCase()
    const user = await User.findOne({ email: emailLowercase });
    if (!user) throw new UnauthenticatedError('No hay un usuario registrado con ese email.')

    // token generated for reset password
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT, {
        expiresIn: "800s"
    });

    const setUserToken = await User.findByIdAndUpdate({ _id: user._id }, { verifyToken: token }, { new: true });

    if (setUserToken) {
        const mailOptions = {
            from: process.env.ZOHO_USER,
            to: emailLowercase,
            subject: "Recuperar contraseña",
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

// NO FUNCIONAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
// verify user for forgot password time
export const forgotPassword = async (req, res) => {
    const { id, token } = req.params;
    console.log(id, token)
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
