const mongoose = require('mongoose')
require("dotenv").config()
const connection = mongoose.connect(process.env.dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    writeConcern: { w: 'majority' },
  })


module.exports={
    connection
}