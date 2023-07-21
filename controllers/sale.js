import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js'
import OverallStat from '../models/OverallStat.js'

export const getSales = async (req, res) => {
    const overallStats = await OverallStat.find()
    if (!overallStats) throw new NotFoundError("No se pudo encontrar las estadísticas generales, intentar más tarde.")

    res.status(StatusCodes.OK).json(overallStats[0]) // just for this case (2021()
}