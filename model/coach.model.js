const mongoose = require('mongoose');

const seatSchema= mongoose.Schema({
    seatNumber: { type: Number, required: true },
    rowNumber: { type: Number, required: true },
    isBooked: { type: Boolean, default: false },
})

const coachSchema=mongoose.Schema({
    seats:[seatSchema]
})

const coachModel= mongoose.model("coach",coachSchema)
const seatModel= mongoose.model("seat",seatSchema)
module.exports ={
    coachModel,
    seatModel
}