const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const catchAsync = require("../utils/catchAsync");

// POST /api/enquiries   body: { propertyId, message }
const createEnquiry = catchAsync(async (req, res) => {
  const { propertyId, message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (String(property.owner) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot enquire about your own property" });
  }

  const enquiry = await Enquiry.create({
    property: property._id,
    business: req.user._id,
    owner: property.owner,
    message: message && message.trim() ? message.trim() : undefined // undefined -> schema default text
  });

  res.status(201).json({ enquiry });
});

// GET /api/enquiries - enquiries I sent AND enquiries I received
const myEnquiries = catchAsync(async (req, res) => {
  const enquiries = await Enquiry.find({ $or: [{ business: req.user._id }, { owner: req.user._id }] })
    .populate("property", "title location photos")
    .populate("business", "name")
    .sort({ createdAt: -1 });

  // Mark which ones I received, so the page can show the right buttons.
  const list = enquiries.map((e) => {
    const obj = e.toObject();
    obj.received = String(e.owner) === String(req.user._id);
    return obj;
  });
  res.json({ enquiries: list });
});

// PATCH /api/enquiries/:id/status   body: { status }   (only the owner who received it)
const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!["Responded", "Scheduled"].includes(status)) {
    return res.status(400).json({ message: "Status must be Responded or Scheduled" });
  }

  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
  if (String(enquiry.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Only the property owner can update this" });
  }

  enquiry.status = status;
  await enquiry.save();
  res.json({ enquiry });
});

module.exports = { createEnquiry, myEnquiries, updateStatus };
