// What a business needs (the "For Business" form). One document per user.
const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessType: { type: String, default: "" },
    sqft: { type: Number, default: 0 },
    power: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    location: { type: String, default: "" },
    truckAccess: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);
