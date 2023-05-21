import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js'
import Publication from "../models/Publication.js"

export const createPublication = async (req, res) => {

    const newPublication = new Publication({ ...req.body })

    const savedPublication = await newPublication.save()
    console.log(savedPublication)
    res.status(StatusCodes.OK).json(savedPublication)

}

export const updatePublication = async (req, res) => {
    const updatedPublication = await Publication.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    if (!updatedPublication) throw new NotFoundError('Publicación no existe')

    res.status(StatusCodes.OK).json(updatedPublication)

}

export const deletePublication = async (req, res) => {
    const publication = await Publication.findByIdAndDelete(req.params.id)
    if (!publication) throw new NotFoundError('Publicación no existe')

    res.status(StatusCodes.OK).json('Publicación ha sido eliminada.')

}

export const getPublication = async (req, res) => {

    const publication = await Publication.findById(req.params.id)

    if (!publication) throw new NotFoundError('Publicación no existe.')
    res.status(StatusCodes.OK).json(publication)

}

export const getPublications = async (req, res) => {

    const publications = await Publication.find()

    res.status(StatusCodes.OK).json(publications)

}