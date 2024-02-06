const mongoose = require("mongoose");

const dbConnect = () => {
   try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB connected successfully`);
   }
   catch (error) {
    console.log(`MongoDB connection error: ${error}`);
   }
};

module.exports = dbConnect;