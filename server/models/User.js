// STEP 1 of Mongoose (sir's notes): make a SCHEMA = the shape of one document.
// STEP 2: make a MODEL from it = the object that gives us create / find / updateOne / deleteOne.
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false }, // select:false = never returned by default
    role: { type: String, enum: ["business", "owner", "admin"], default: "business" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }] // saved properties
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Runs automatically before every save: turns the plain password into a hash.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Used at login: compares the typed password with the stored hash.
userSchema.methods.matchPassword = function (typedPassword) {
  return bcrypt.compare(typedPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
