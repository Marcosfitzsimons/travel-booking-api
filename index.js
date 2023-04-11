import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';
import 'express-async-errors'
import authRoute from './routes/auth.js'
import usersRoute from './routes/users.js'
import tripsRoute from './routes/trips.js'
import passengersRoute from './routes/passengers.js'
import connectDB from './db/connect.js'

const app = express()
dotenv.config()

// ignore warning
mongoose.set('strictQuery', false)

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
})

// middlewares
app.use(cors())
app.use(cookieParser())
app.use(express.json())

/*
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
})); 
*/

app.use("/api/auth", authRoute)
app.use("/api/users", usersRoute)
app.use("/api/trips", tripsRoute)
app.use("/api/passengers", passengersRoute)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500
    const errorMessage = err.message || "Something went wrong!"
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    })
})

const port = process.env.PORT || 8800;

const start = async () => {
    try {
        await connectDB(process.env.MONGO)
        app.listen(port, () =>
            console.log(`Connected to backend. Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
