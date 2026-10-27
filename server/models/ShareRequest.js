// "I want to become a shareholder of this property" - waits for the property's admin to decide.
const mongoose = require("mongoose");

const shareRequestSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requesterName: String,
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShareRequest", shareRequestSchema);
