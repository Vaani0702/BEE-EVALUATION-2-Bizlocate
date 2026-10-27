// Co-ownership: many people can hold a % of one property.
// The person who listed it is its ADMIN. Others send a request, the admin approves or rejects.
const Property = require("../models/Property");
const ShareRequest = require("../models/ShareRequest");
const catchAsync = require("../utils/catchAsync");

const isAdminOf = (property, user) =>
  property.shareholders.some((s) => String(s.user) === String(user._id) && s.isAdmin);

// POST /api/shares/:propertyId   - ask to become a shareholder
const requestShare = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ message: "Property not found" });

  if (property.shareholders.some((s) => String(s.user) === String(req.user._id))) {
    return res.status(400).json({ message: "You already own a share of this property" });
  }
  const already = await ShareRequest.findOne({
    property: property._id, requester: req.user._id, status: "Pending"
  });
  if (already) return res.status(400).json({ message: "You already have a pending request" });

  const request = await ShareRequest.create({
    property: property._id,
    requester: req.user._id,
    requesterName: req.user.name
  });
  res.status(201).json({ request });
});

// GET /api/shares/property/:propertyId
// The admin of the property sees ALL pending requests, everyone else only their own.
const getRequestsForProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const filter = { property: property._id, status: "Pending" };
  const admin = isAdminOf(property, req.user);
  if (!admin) filter.requester = req.user._id;

  const requests = await ShareRequest.find(filter).sort({ createdAt: 1 });
  res.json({ requests, isAdmin: admin });
});

// PATCH /api/shares/:requestId   body: { decision: "approve" | "reject", percent }
const decideRequest = catchAsync(async (req, res) => {
  const { decision, percent } = req.body;

  const request = await ShareRequest.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: "Request not found" });
  if (request.status !== "Pending") return res.status(400).json({ message: "Already decided" });

  const property = await Property.findById(request.property);
  if (!property || !isAdminOf(property, req.user)) {
    return res.status(403).json({ message: "Only the admin of this property can decide" });
  }

  if (decision === "reject") {
    request.status = "Rejected";
    await request.save();
    return res.json({ request, property });
  }
  if (decision !== "approve") return res.status(400).json({ message: 'decision must be "approve" or "reject"' });

  // Approve: the percent given away is taken from the admin's own share.
  const adminShare = property.shareholders.find((s) => s.isAdmin);
  const give = Number(percent);
  if (!give || give <= 0 || give >= adminShare.percent) {
    return res.status(400).json({
      message: "Enter a percent above 0 and below the admin's current share (" + adminShare.percent + "%)"
    });
  }

  adminShare.percent -= give;
  property.shareholders.push({
    user: request.requester,
    name: request.requesterName,
    percent: give,
    isAdmin: false
  });
  await property.save();

  request.status = "Approved";
  await request.save();

  res.json({ request, property });
});

module.exports = { requestShare, getRequestsForProperty, decideRequest };
