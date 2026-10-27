// Connects Mongoose (our MongoDB helper library) to the database.
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/bizlocate";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", uri);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Is MongoDB running? Start it, then run this again.");
    process.exit(1); // stop the server, it is useless without a database
  }
}

module.exports = connectDB;
