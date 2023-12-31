const express = require('express');
const { coachModel, seatModel } = require('../model/coach.model');

const coachRouter= express.Router();

coachRouter.get("/",async(req,res)=>{
    try {
    const seats= await seatModel.find()
    seats.sort((a,b)=>((a.seatNumber+7*(a.rowNumber-1))-(b.seatNumber+7*(b.rowNumber-1))))
    res.send(seats)
    } catch (error) {
        res.status(400).send(error.message)
    }
})
coachRouter.post("/postSeats",async(req,res)=>{
    try {
        await seatModel.collection.drop()
        const seats = [];
        let seatNumber = 1;
        let rowNumber = 1;
    
        for (let i = 1; i <= 80; i++) {
          seats.push({
            seatNumber,
            rowNumber,
            isBooked: false,
          });
    
          seatNumber++;
    
          if (rowNumber !== 12 && seatNumber > 7) {
            rowNumber++;
            seatNumber = 1;
          }
        }

      
         // Insert the seat objects into the seatModel
    const data= await seatModel.insertMany(seats);

    console.log('Seats and coach initialized successfully.');
      res.send(data)
        
    } catch (error) {
        console.log(error.message)
    }
})

coachRouter.patch("/bookSeat",async(req,res)=>{
    try {
       
        const numberOfSeats= req.body.seats;
       
        const emptySeats = await seatModel.find({ isBooked: false });

        function allocateSeats(numSeats) {
          let allocatedSeats = [];
        
          const row = findRowWithAvailableSeats(numSeats);
          if (row !== -1) {
            allocateSeatsInRow(numSeats, row);
          } else {
            allocateSeatsAcrossRows(numSeats);
          }
        
          function findRowWithAvailableSeats(seatsNeeded) {
            let row = -1;
            for (let i = 0; i < emptySeats.length; i++) {
              const seat = emptySeats[i];
              if (seat.isBooked === false && seat.seatNumber + seatsNeeded <= 8) {
                row = seat.rowNumber;
                break;
              }
            }
            return row;
          }
        
          function allocateSeatsInRow(seatsNeeded, row) {
            const rowSeats = emptySeats.filter((seat) => seat.rowNumber === row);
            const availableSeats = rowSeats.filter((seat) => seat.isBooked === false);
            if (availableSeats.length >= seatsNeeded) {
              for (let i = 0; i < seatsNeeded; i++) {
                const seat = availableSeats[i];
                allocatedSeats.push({ seatNumber: seat.seatNumber, rowNumber: seat.rowNumber, _id: seat._id });
                seat.isBooked = true;
              }
            } else {
              allocateSeatsAcrossRows(seatsNeeded);
            }
          }
        
          function allocateSeatsAcrossRows(seatsNeeded) {
            const sortedSeats = emptySeats
              .filter((seat) => seat.isBooked === false)
              .sort((a, b) => (a.seatNumber+7*(a.rowNumber-1)) - (b.seatNumber+7*(b.rowNumber-1)));
        
            let minDiff = Infinity;
            let startIndex = -1;
        
            for (let i = 0; i <= sortedSeats.length - seatsNeeded; i++) {
              const diff = (sortedSeats[i + seatsNeeded - 1].seatNumber+7*(sortedSeats[i + seatsNeeded - 1].rowNumber-1)) - (sortedSeats[i].seatNumber+7*(sortedSeats[i].rowNumber-1));
              if (diff < minDiff) {
                minDiff = diff;
                startIndex = i;
              }
            }
        
            if (startIndex !== -1) {
              const selectedSeats = sortedSeats.slice(startIndex, startIndex + seatsNeeded);
              for (let i = 0; i < selectedSeats.length; i++) {
                const seat = selectedSeats[i];
                allocatedSeats.push({ seatNumber: seat.seatNumber, rowNumber: seat.rowNumber, _id: seat._id });
                seat.isBooked = true;
              }
            }
          }
        
          return allocatedSeats;
        }
        
        
        
          const seatNumbers =allocateSeats(numberOfSeats);
          const allocatedSeatIds = seatNumbers.map((seat) => seat._id);

        await  seatModel.updateMany(
            { _id: { $in: allocatedSeatIds } }, // Find seats with the allocated IDs
            { isBooked: true }
          );

          const allocatedSeats=seatNumbers.map(el=>{
return el.seatNumber+ (el.rowNumber-1)*7
          })


          res.send(allocatedSeats);
    } catch (error) {
        res.status(400).send(error.message);
    }
})
module.exports ={
    coachRouter
}