import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'No token provided' });

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        jwt.verify(
            token,
            process.env.JWT,
            async (err, decoded) => {
                if (err) return res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid token provided' })
                req.user = await User.findById(decoded.id).select('-password')
                next();
            }
        );
    } else {
        return res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid token provided' })
    }

}

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.params.id) {
            // If the "id" parameter is present, perform the authorization check
            if (req.user.id === req.params.id || req.user.isAdmin) {
                next();
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'You are not authorized' });
            }
        } else {
            // If the "id" parameter is not present, proceed without throwing an error
            // Unauthenticated users can access endpoints
            next();
        }
    });
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'You are not authorized' });
        }
    });
};