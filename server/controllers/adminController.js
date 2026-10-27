const Property = require("../models/Property");
const User = require("../models/User");
const Enquiry = require("../models/Enquiry");
const catchAsync = require("../utils/catchAsync");

// GET /api/admin/properties?status=pending
// The verification queue. The admin needs the document flag to know a PDF exists.
const listForVerification = catchAsync(async (req, res) => {
  const filter = {};
  if (["pending", "verified", "rejected"].includes(req.query.status)) {
    filter.verification = req.query.status;
  }

  const properties = await Property.find(filter).select("+ownershipDoc").sort({ createdAt: -1 });
  const result = properties.map((p) => {
    const obj = p.toObject();
    obj.hasDocument = !!obj.ownershipDoc;
    delete obj.ownershipDoc;
    return obj;
  });
  res.json({ properties: result });
});

// PATCH /api/admin/properties/:id/verify   body: { decision: "verified" | "rejected", reason }
const verifyProperty = catchAsync(async (req, res) => {
  const { decision, reason } = req.body;
  if (!["verified", "rejected"].includes(decision)) {
    return res.status(400).json({ message: 'decision must be "verified" or "rejected"' });
  }
  if (decision === "rejected" && !reason) {
    return res.status(400).json({ message: "Please give a reason for rejecting" });
  }

  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  property.verification = decision;
  property.rejectionReason = decision === "rejected" ? reason : "";
  if (decision === "verified") property.grade = property.grade === "Standard" ? "Grade A" : property.grade;
  await property.save();

  res.json({ property });
});

// GET /api/admin/stats
const getStats = catchAsync(async (req, res) => {
  const users = await User.countDocuments();
  const properties = await Property.countDocuments();
  const enquiries = await Enquiry.countDocuments();

  // MongoDB AGGREGATION: group the properties by verification status and count each group.
  // Result looks like: [ { _id: "verified", count: 5 }, { _id: "pending", count: 2 } ]
  const grouped = await Property.aggregate([{ $group: { _id: "$verification", count: { $sum: 1 } } }]);
  const byStatus = { pending: 0, verified: 0, rejected: 0 };
  grouped.forEach((g) => { byStatus[g._id] = g.count; });

  const business = await User.countDocuments({ role: "business" });
  const owners = await User.countDocuments({ role: "owner" });

  res.json({ users, business, owners, properties, enquiries, byStatus });
});

module.exports = { listForVerification, verifyProperty, getStats };
