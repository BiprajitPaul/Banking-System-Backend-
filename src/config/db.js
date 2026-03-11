const mongoose = require('mongoose');
async function connectDB() {

    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log('Connected to database');
    })
    .catch(error=>{
        console.log('Error connecting to MongoDB database:');
        process.exit(1);
    })
}

module.exports = connectDB;