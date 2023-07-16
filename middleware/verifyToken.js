import jwt from 'jsonwebtoken'
import { UnauthenticatedError } from '../errors/index.js'
import User from '../models/User.js'
import { createError } from '../utils/error.js'

export const verifyToken = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthenticatedError('No token provided.')
    const token = authHeader.split(' ')[1]


    if (authHeader && authHeader.startsWith('Bearer ')) {
        const decoded = jwt.verify(token, process.env.JWT)
        req.user = await User.findById(decoded.id).select('-password')
        next()
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