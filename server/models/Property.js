// One document in the "properties" collection = one industrial listing.
const mongoose = require("mongoose");

// A small sub-schema: one person's share of the property.
// The person who lists the property is the admin and starts with 100%.
const shareholderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  percent: Number,
  isAdmin: { type: Boolean, default: false }
});

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["manufacturing", "logistics", "warehousing", "rd"], default: "warehousing" },
    location: { type: String, required: true, trim: true },
    area: { type: Number, default: 0 },          // built-up area in sqft
    rent: { type: Number, default: 0 },          // rupees per sqft per month
    power: { type: Number, default: 0 },         // HP
    height: { type: String, default: "-" },
    docks: { type: String, default: "-" },
    flooring: { type: String, default: "-" },
    zoning: { type: String, default: "-" },
    truckAccess: { type: Boolean, default: false },
    grade: { type: String, default: "Standard" },
    availability: { type: String, enum: ["Available", "Draft"], default: "Available" },
    description: { type: String, default: "No description provided." },

    // Files uploaded with Multer
    photos: [String],                            // e.g. "/uploads/photos/1699.jpg" (public)
    ownershipDoc: { type: String, select: false }, // PDF file name (private: only owner + admin can open it)

    // Admin verification
    verification: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    rejectionReason: { type: String, default: "" },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: String,
    shareholders: [shareholderSchema],
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
