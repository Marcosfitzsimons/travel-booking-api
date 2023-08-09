import SpecialPassenger from "../models/SpecialPassenger.js";

async function createNewSpecialPassengers(count) {
    const newPassengers = [];

    for (let i = 0; i < count; i++) {
        const newPassenger = new SpecialPassenger({});
        await newPassenger.save();
        newPassengers.push(newPassenger);
    }

    return newPassengers;
}

export default createNewSpecialPassengers