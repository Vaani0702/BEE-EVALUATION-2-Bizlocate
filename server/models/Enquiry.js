// A message from a business to the owner of a property.
const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who sent it
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },    // who receives it
    message: { type: String, default: "Hi, I am interested in this property. Please share more details." },
    status: { type: String, enum: ["Pending", "Responded", "Scheduled"], default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
