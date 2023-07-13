const express = require('express');
const { coachModel, seatModel } = require('../model/coach.model');

const coachRouter= express.Router();

coachRouter.get("/",async(req,res)=>{
    try {
    const seats= await seatModel.find()
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
       
        const emptySeats=await seatModel.find({isBooked:false})
        function allocateSeats(numSeats) {
            let allocatedSeats = [];
          
            // Check if there are enough seats available in one row
            const row = findRowWithAvailableSeats(numSeats);
            if (row !== -1) {
              allocateSeatsInRow(numSeats, row);
            } else {
              // If there are no available seats in one row, allocate seats across multiple rows
              allocateSeatsAcrossRows(numSeats);
            }
          
            // Function to find a row with available seats
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
          
            // Function to allocate seats in a specific row
            function allocateSeatsInRow(seatsNeeded, row) {
              const rowSeats = emptySeats.filter((seat) => seat.rowNumber === row);
              const availableSeats = rowSeats.filter((seat) => seat.isBooked === false);
              if (availableSeats.length >= seatsNeeded) {
                for (let i = 0; i < seatsNeeded; i++) {
                  const seat = availableSeats[i];
                  allocatedSeats.push({ seatNumber: seat.seatNumber, rowNumber: seat.rowNumber ,_id:seat._id});
                  seat.isBooked = true;
                }
        
              } else {
              
                allocateSeatsAcrossRows(seatsNeeded);
              }
            }
          
            // Function to allocate seats across multiple rows
            function allocateSeatsAcrossRows(seatsNeeded) {
              let remainingSeats = emptySeats.filter((seat) => seat.isBooked === false);
              for (let i = 0; i < remainingSeats.length; i++) {
                const seat = remainingSeats[i];
                if (allocatedSeats.length === seatsNeeded) {
                  break;
                }
                if (seat.isBooked === false) {
                  allocatedSeats.push({ seatNumber: seat.seatNumber, rowNumber: seat.rowNumber,_id:seat._id});
                  seat.isBooked = true;
                }
              }
          
              if (allocatedSeats.length < seatsNeeded) {
                console.log(`Insufficient seats available. Only ${allocatedSeats.length} seats allocated.`);
              } else {
                console.log(`Seats ${allocatedSeats.map((seat) => `${seat.seatNumber} (Row ${seat.rowNumber})`).join(', ')} allocated as near as possible.`);
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