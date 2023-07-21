import mongoose from "mongoose";

const OverallStatSchema = new mongoose.Schema({
    totalCustomers: {
        type: Number
    },
    yearlySalesTotal: {
        type: Number
    },
    yearlyTotalSoldUnits: {
        type: Number
    },
    year: {
        type: Number
    },
    monthlyData: [
        {
            month: String,
            totalSales: Number,
            totalUnits: Number,
        }
    ],
    dailyData: [
        {
            date: String,
            totalSales: Number,
            totalUnits: Number,
        }
    ],

}, { timestamps: true })

export default mongoose.model('OverallStat', OverallStatSchema)