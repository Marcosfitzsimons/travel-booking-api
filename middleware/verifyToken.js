import jwt from 'jsonwebtoken'
import { ForbiddenError, UnauthenticatedError } from '../errors/index.js'
import User from '../models/User.js'

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) throw new UnauthenticatedError('No token provided.')

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        jwt.verify(
            token,
            process.env.JWT,
            async (err, decoded) => {
                if (err) return res.sendStatus(403); //invalid token
                req.user = await User.findById(decoded.id).select('-password -cpassword')
                next();
            }
        );
    } else {
        throw new ForbiddenError('Invalid token provided.')
    }

}

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.params.id) {
            // If the "id" parameter is present, perform the authorization check
            if (req.user.id === req.params.id || req.user.isAdmin) {
                next();
            } else {
                throw new UnauthenticatedError('No estas autorizado');
            }
        } else {
            // If the "id" parameter is not present, proceed without throwing an error
            // Unauthenticated users can access the getPublications endpoint
            next();
        }
    });
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            throw new UnauthenticatedError('No estas autorizado, no sos admin.')
        }
    });
};