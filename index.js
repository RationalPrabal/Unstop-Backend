const express = require("express")
const cors= require("cors")
const { connection } = require("./config/db")
const { coachRouter } = require("./routes/coach.route")
const app = express()

app.use(express.json())

app.use(cors(
    {
        origin:"*"
    }

))

app.use('/coach',coachRouter)

app.listen(4600, async()=>{
try {
    await connection
    console.log("Connected to the database")
} catch (error) {
    console.log(error.message)
}
console.log("server is running")
})