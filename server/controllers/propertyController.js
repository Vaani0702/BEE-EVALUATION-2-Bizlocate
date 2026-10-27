const path = require("path");
const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");
const ShareRequest = require("../models/ShareRequest");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { removeUploads, removeMulterFiles } = require("../utils/removeFiles");

// ownershipDoc is private, so before sending a property to a browser we replace the
// file name with a simple true/false flag.
function withDocFlag(property) {
  const obj = property.toObject();
  obj.hasDocument = !!obj.ownershipDoc;
  delete obj.ownershipDoc;
  return obj;
}

const isOwnerOrAdmin = (property, user) =>
  !!user && (user.role === "admin" || String(property.owner) === String(user._id));

// GET /api/properties   (public)
// Everyone sees Available listings that are not rejected.
// Verified listings are ranked above unverified ones.
const listProperties = catchAsync(async (req, res) => {
  const properties = await Property.find({
    availability: "Available",
    verification: { $ne: "rejected" }
  }).sort({ createdAt: -1 });

  // true - false = 1 / 0 / -1, so verified ones float to the top. Array.sort is stable,
  // so the newest-first order is kept inside each group.
  properties.sort((a, b) => (b.verification === "verified") - (a.verification === "verified"));

  res.json({ properties });
});

// GET /api/properties/mine   (logged in) - everything I own a share of, any status
const myProperties = catchAsync(async (req, res) => {
  const properties = await Property.find({ "shareholders.user": req.user._id })
    .select("+ownershipDoc")
    .sort({ createdAt: -1 });
  res.json({ properties: properties.map(withDocFlag) });
});

// GET /api/properties/:id   (public, but we look at WHO is asking)
const getProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id).select("+ownershipDoc");
  if (!property) return res.status(404).json({ message: "Property not found" });

  const canSeeAll = isOwnerOrAdmin(property, req.user);
  const hidden = property.verification === "rejected" || property.availability === "Draft";
  if (hidden && !canSeeAll) return res.status(404).json({ message: "Property not found" });

  // Count a view (but not when the owner is just checking their own page).
  if (!isOwnerOrAdmin(property, req.user)) {
    await Property.updateOne({ _id: property._id }, { $inc: { views: 1 } });
    property.views += 1;
  }

  const obj = withDocFlag(property);
  if (!canSeeAll) obj.rejectionReason = ""; // reason is only for owner/admin
  res.json({ property: obj });
});

// POST /api/properties   (owner only) - the List Property form, with files
// Multer already ran before this function: text is in req.body, files are in req.files.
const createProperty = catchAsync(async (req, res) => {
  const files = req.files || {};
  const b = req.body;

  if (!b.title || !b.location) {
    removeMulterFiles(files);
    return res.status(400).json({ message: "Title and location are required" });
  }
  if (!files.ownershipDoc) {
    removeMulterFiles(files);
    return res.status(400).json({ message: "Please upload your ownership document (PDF)" });
  }

  const photos = (files.photos || []).map((f) => "/uploads/photos/" + f.filename);

  const property = await Property.create({
    title: b.title,
    type: b.type || "warehousing",
    location: b.location,
    area: Number(b.area) || 0,
    rent: Number(b.rent) || 0,
    power: Number(b.power) || 0,
    height: b.height || "-",
    docks: b.docks || "-",
    flooring: b.zoning || "-",
    zoning: b.zoning || "-",
    truckAccess: b.truckAccess === "yes",
    description: b.description || undefined,
    photos,
    ownershipDoc: files.ownershipDoc[0].filename,
    owner: req.user._id,
    ownerName: req.user.name,
    // The person who lists it becomes the admin and holds 100% until others are approved.
    shareholders: [{ user: req.user._id, name: req.user.name, percent: 100, isAdmin: true }]
  });

  res.status(201).json({ property: withDocFlag(property) });
});

// DELETE /api/properties/:id   (owner of it, or admin)
const deleteProperty = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id).select("+ownershipDoc");
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (!isOwnerOrAdmin(property, req.user)) {
    return res.status(403).json({ message: "Only the owner or an admin can delete this" });
  }

  // 1. delete the files from the disk (fs.unlink)
  removeUploads([...property.photos, property.ownershipDoc ? "docs/" + property.ownershipDoc : null]);
  // 2. delete the related documents (deleteMany) and remove it from every wishlist ($pull)
  await Enquiry.deleteMany({ property: property._id });
  await ShareRequest.deleteMany({ property: property._id });
  await User.updateMany({}, { $pull: { wishlist: property._id } });
  // 3. delete the property itself (deleteOne)
  await Property.deleteOne({ _id: property._id });

  res.json({ message: "Property deleted" });
});

// GET /api/properties/:id/document   (owner of it, or admin)
// The PDF is NOT in a public folder. This route checks the JWT and the role first.
const getDocument = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id).select("+ownershipDoc");
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (!isOwnerOrAdmin(property, req.user)) {
    return res.status(403).json({ message: "Only the owner or an admin can view the document" });
  }
  if (!property.ownershipDoc) return res.status(404).json({ message: "No document uploaded" });

  // path.join builds the full path to the file safely on any operating system.
  res.sendFile(path.join(__dirname, "..", "uploads", "docs", property.ownershipDoc));
});

// GET /api/properties/:id/payouts   (shareholders and admin)
// Rent is split by share percentage:  monthly rent x percent / 100
const getPayouts = catchAsync(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const isShareholder = property.shareholders.some((s) => String(s.user) === String(req.user._id));
  if (!isShareholder && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only shareholders can see the rent split" });
  }

  const monthlyRent = property.rent * property.area;
  const rows = property.shareholders.map((s) => ({
    name: s.name,
    percent: s.percent,
    isAdmin: s.isAdmin,
    amount: Math.round((monthlyRent * s.percent) / 100)
  }));

  res.json({ monthlyRent, rows });
});

module.exports = {
  listProperties, myProperties, getProperty, createProperty,
  deleteProperty, getDocument, getPayouts
};
