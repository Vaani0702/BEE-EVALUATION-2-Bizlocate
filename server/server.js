// Entry point: load .env, connect to MongoDB, then start listening.
require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error('Missing .env file. Copy ".env.example" to ".env" and run again.');
  process.exit(1);
}

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
